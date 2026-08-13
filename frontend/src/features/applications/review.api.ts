import { apiRequest, type ApiErrorCode } from '@/shared/api/client';

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

function mapReviewErrorCode(status: number): ApiErrorCode {
  if (status === 401) return 'invalid_credentials';
  return 'generic';
}

export function getClientReview(token: string, applicationId: string) {
  return apiRequest<ClientReview>(`/applications/${applicationId}/review`, {
    token,
    mapErrorCode: mapReviewErrorCode,
  });
}

export function resubmitSection(token: string, applicationId: string, section: string) {
  return apiRequest<{ success: boolean }>(
    `/applications/${applicationId}/sections/${section}/resubmit`,
    { token, method: 'POST', mapErrorCode: mapReviewErrorCode },
  );
}
