import { beginColdStartRetry, endColdStartRetry } from '@/shared/api/coldStart';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const COLD_START_RETRY_DELAY_MS = 3000;
// Render's free tier spins the backend down after inactivity, and Neon's free tier scales
// its compute to zero too — the first request after a pause can time out or bounce off a
// gateway that isn't ready yet. Those are retried once, transparently, before surfacing
// an error to the caller.
function isColdStartFailure(res: Response | null): boolean {
  if (!res) return true; // fetch() itself threw — network error, possibly the host still waking up
  return [502, 503, 504].includes(res.status);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SESSION_STORAGE_KEY = 'afaaq.session';

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
}

export type ApiErrorCode = 'email_taken' | 'invalid_credentials' | 'validation' | 'network' | 'generic';

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  details?: string[];

  constructor(status: number, code: ApiErrorCode, message: string, details?: string[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function defaultCodeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return 'invalid_credentials';
  if (status === 400) return 'validation';
  return 'generic';
}

export interface ApiRequestOptions extends RequestInit {
  /** Bearer token, if the endpoint requires auth. */
  token?: string;
  /** Override the default HTTP-status -> ApiErrorCode mapping for this call. */
  mapErrorCode?: (status: number) => ApiErrorCode;
}

/**
 * Single fetch client shared by every feature's API module.
 * Centralizes error parsing/mapping so feature api files only declare endpoints.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, mapErrorCode, headers, ...rest } = options;

  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
    });

  let res: Response | null;
  try {
    res = await doFetch();
  } catch {
    res = null;
  }

  if (isColdStartFailure(res)) {
    beginColdStartRetry();
    try {
      await delay(COLD_START_RETRY_DELAY_MS);
      res = await doFetch();
    } catch {
      res = null;
    } finally {
      endColdStartRetry();
    }
  }

  if (!res) {
    throw new ApiError(0, 'network', 'network');
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let details: string[] | undefined;
    try {
      const body = await res.json();
      if (Array.isArray(body.message)) {
        details = body.message;
        message = body.message[0];
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      // ignore body parse errors, keep default message
    }
    throw new ApiError(res.status, (mapErrorCode ?? defaultCodeFromStatus)(res.status), message, details);
  }

  return res.json() as Promise<T>;
}
