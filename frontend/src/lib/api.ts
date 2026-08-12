export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const SESSION_STORAGE_KEY = 'afaaq.session';

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as {token?: string;}).token ?? null;
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

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 409) return 'email_taken';
  if (status === 401) return 'invalid_credentials';
  if (status === 400) return 'validation';
  return 'generic';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {})
      }
    });
  } catch {
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
    throw new ApiError(res.status, codeFromStatus(res.status), message, details);
  }

  return res.json() as Promise<T>;
}

export type UserRole = 'CLIENT' | 'ADMIN';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  residence: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  residence?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function registerUser(payload: RegisterPayload) {
  return request<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload: LoginPayload) {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchMe(token: string) {
  return request<AuthUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
