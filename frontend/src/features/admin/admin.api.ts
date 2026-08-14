import { API_URL, ApiError, apiRequest, type ApiErrorCode } from '@/shared/api/client';
import type { BackendCountryCode, BackendServiceType, DocumentRecord, DocumentRequirement } from '@/features/applications/applications.api';
import type { DossierReview, SectionReview, SectionStatus } from '@/features/applications/review.api';
import type { FormConfig } from '@/shared/types/formConfig';

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

function mapAdminErrorCode(status: number): ApiErrorCode {
  if (status === 403) return 'invalid_credentials';
  if (status === 401) return 'invalid_credentials';
  if (status === 400) return 'validation';
  return 'generic';
}

export function listApplications(token: string, filters: AdminListFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return apiRequest<AdminApplicationRow[]>(`/admin/applications${qs ? `?${qs}` : ''}`, {
    token,
    mapErrorCode: mapAdminErrorCode,
  });
}

export function getApplicationDetail(token: string, applicationId: string) {
  return apiRequest<AdminApplicationDetail>(`/admin/applications/${applicationId}`, {
    token,
    mapErrorCode: mapAdminErrorCode,
  });
}

export function reviewSection(
  token: string,
  applicationId: string,
  section: string,
  payload: { status: SectionStatus; remark?: string; }
) {
  return apiRequest<SectionReview>(`/admin/applications/${applicationId}/sections/${section}/review`, {
    token,
    method: 'POST',
    body: JSON.stringify(payload),
    mapErrorCode: mapAdminErrorCode,
  });
}

export function finalizeDossier(token: string, applicationId: string) {
  return apiRequest<DossierReview>(`/admin/applications/${applicationId}/finalize`, {
    token,
    method: 'POST',
    mapErrorCode: mapAdminErrorCode,
  });
}

export function extractDocument(token: string, applicationId: string, documentId: string) {
  return apiRequest<{ original: string; translatedDe: string }>(
    `/admin/applications/${applicationId}/documents/${documentId}/extract`,
    { token, mapErrorCode: mapAdminErrorCode },
  );
}

export async function fetchAdminDocumentPreviewUrl(
  token: string,
  applicationId: string,
  documentId: string
): Promise<string> {
  const res = await fetch(
    `${API_URL}/admin/applications/${applicationId}/documents/${documentId}/file`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new ApiError(res.status, mapAdminErrorCode(res.status), `HTTP ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
