import { API_URL, ApiError } from './api';
import type { BackendCountryCode, BackendServiceType, DocumentRecord, DocumentRequirement } from './applicationsApi';
import type { DossierReview, SectionReview, SectionStatus } from './reviewApi';
import type { FormConfig } from '../types/formConfig';

export interface AdminApplicationRow {
  id: string;
  fullName: string;
  email: string;
  service: BackendServiceType;
  country: BackendCountryCode;
  status: 'DRAFT' | 'SUBMITTED';
  reviewStatus: 'pending' | 'approved' | 'needs_correction';
  completion: number;
  createdAt: string;
}

export interface AdminApplicationDetail {
  id: string;
  service: BackendServiceType;
  country: BackendCountryCode;
  status: 'DRAFT' | 'SUBMITTED';
  user: { id: string; fullName: string; email: string };
  config: FormConfig;
  stepData: {
    personal: Record<string, unknown> | null;
    passport: Record<string, unknown> | null;
    languages: unknown[] | null;
    education: unknown[] | null;
    trainings: unknown[] | null;
    experience: unknown[] | null;
    objective: Record<string, unknown> | null;
  };
  translations: Record<string, string>;
  requirements: DocumentRequirement[];
  documents: DocumentRecord[];
  sectionReviews: SectionReview[];
  dossierReview: DossierReview | null;
}

export interface AdminListFilters {
  status?: 'pending' | 'approved' | 'needs_correction';
  country?: BackendCountryCode;
  service?: BackendServiceType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
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
    throw new ApiError(res.status, res.status === 403 ? 'invalid_credentials' : 'generic', message);
  }
  return res.json() as Promise<T>;
}

export function listApplications(token: string, filters: AdminListFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return request<AdminApplicationRow[]>(`/admin/applications${qs ? `?${qs}` : ''}`, token);
}

export function getApplicationDetail(token: string, applicationId: string) {
  return request<AdminApplicationDetail>(`/admin/applications/${applicationId}`, token);
}

export function reviewSection(
  token: string,
  applicationId: string,
  section: string,
  payload: { status: SectionStatus; remark?: string; }
) {
  return request<SectionReview>(`/admin/applications/${applicationId}/sections/${section}/review`, token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function finalizeDossier(token: string, applicationId: string) {
  return request<DossierReview>(`/admin/applications/${applicationId}/finalize`, token, {
    method: 'POST'
  });
}

export function extractDocument(token: string, applicationId: string, documentId: string) {
  return request<{original: string;translatedDe: string;}>(
    `/admin/applications/${applicationId}/documents/${documentId}/extract`,
    token
  );
}
