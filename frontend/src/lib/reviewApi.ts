import { API_URL, ApiError } from './api';

export type SectionStatus = 'PENDING' | 'APPROVED' | 'NEEDS_CORRECTION';

export interface SectionReview {
  id: string;
  applicationId: string;
  section: string;
  status: SectionStatus;
  remark: string | null;
  remarkFr: string | null;
  remarkAr: string | null;
  reviewerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DossierReview {
  id: string;
  applicationId: string;
  status: 'PENDING' | 'VALIDATED';
  reviewerId: string | null;
  decidedAt: string | null;
}

export interface ClientReview {
  sections: SectionReview[];
  dossier: DossierReview | null;
}

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {})
      }
    });
  } catch {
    throw new ApiError(0, 'network', 'network');
  }
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.message === 'string') message = body.message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, res.status === 401 ? 'invalid_credentials' : 'generic', message);
  }
  return res.json() as Promise<T>;
}

export function getClientReview(token: string, applicationId: string) {
  return request<ClientReview>(`/applications/${applicationId}/review`, token);
}

export function resubmitSection(token: string, applicationId: string, section: string) {
  return request<{success: boolean;}>(
    `/applications/${applicationId}/sections/${section}/resubmit`,
    token,
    { method: 'POST' }
  );
}
