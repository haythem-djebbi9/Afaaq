import { API_URL, ApiError, apiRequest, type ApiErrorCode } from '@/shared/api/client';

export type BackendServiceType = 'VISA' | 'TRAINING' | 'JOB' | 'DIPLOMA';
export type BackendCountryCode = 'DE' | 'AT' | 'IT' | 'FR';
export type DocumentStatus = 'UPLOADED' | 'ERROR';
export type ApplicationStatus = 'DRAFT' | 'SUBMITTED';
export type PaymentStatus = 'UNPAID' | 'PAID';

export interface DocumentRequirement {
  type: string;
  labelKey: string;
  required: boolean;
  step: 2 | 8;
}

export interface DocumentRecord {
  id: string;
  type: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  service: BackendServiceType;
  country: BackendCountryCode;
  status: ApplicationStatus;
  personal: Record<string, unknown> | null;
  passport: Record<string, unknown> | null;
  languages: unknown[] | null;
  education: unknown[] | null;
  trainings: unknown[] | null;
  experience: unknown[] | null;
  objective: Record<string, unknown> | null;
  paymentStatus: PaymentStatus;
  requirements: DocumentRequirement[];
  documents: DocumentRecord[];
}

export interface UpdateApplicationDataPayload {
  personal?: Record<string, unknown>;
  passport?: Record<string, unknown>;
  languages?: unknown[];
  education?: unknown[];
  trainings?: unknown[];
  experience?: unknown[];
  objective?: Record<string, unknown>;
}

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return 'invalid_credentials';
  if (status === 400) return 'validation';
  return 'generic';
}

export function createApplication(
  token: string,
  service: BackendServiceType,
  country: BackendCountryCode
) {
  return apiRequest<ApplicationRecord>('/applications', {
    token,
    method: 'POST',
    body: JSON.stringify({ service, country }),
    mapErrorCode: codeFromStatus,
  });
}

export function getApplication(token: string, id: string) {
  return apiRequest<ApplicationRecord>(`/applications/${id}`, { token, mapErrorCode: codeFromStatus });
}

export function listMyApplications(token: string) {
  return apiRequest<ApplicationRecord[]>('/applications', { token, mapErrorCode: codeFromStatus });
}

export function updateApplicationData(
  token: string,
  id: string,
  payload: UpdateApplicationDataPayload
) {
  return apiRequest<ApplicationRecord>(`/applications/${id}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(payload),
    mapErrorCode: codeFromStatus,
  });
}

export function createCheckoutSession(token: string, applicationId: string) {
  return apiRequest<{ url: string }>(`/applications/${applicationId}/checkout-session`, {
    token,
    method: 'POST',
    mapErrorCode: codeFromStatus,
  });
}

export function deleteDocument(token: string, applicationId: string, documentId: string) {
  return apiRequest<{ success: boolean }>(`/applications/${applicationId}/documents/${documentId}`, {
    token,
    method: 'DELETE',
    mapErrorCode: codeFromStatus,
  });
}

export class MissingDocumentsError extends Error {
  missing: string[];
  constructor(missing: string[]) {
    super('missing_documents');
    this.missing = missing;
  }
}

export async function submitApplication(token: string, applicationId: string) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/applications/${applicationId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {
    throw new ApiError(0, 'network', 'network');
  }

  if (!res.ok) {
    let body: {message?: string;missing?: string[];} = {};
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    if (res.status === 400 && Array.isArray(body.missing)) {
      throw new MissingDocumentsError(body.missing);
    }
    throw new ApiError(res.status, codeFromStatus(res.status), body.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<ApplicationRecord>;
}

interface UploadOptions {
  onProgress?: (percent: number) => void;
}

function uploadWithProgress(
  method: 'POST' | 'PUT',
  url: string,
  token: string,
  type: string,
  file: File,
  { onProgress }: UploadOptions
): Promise<DocumentRecord> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onerror = () => reject(new ApiError(0, 'network', 'network'));

    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // ignore
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as DocumentRecord);
      } else {
        const message =
        body && typeof body === 'object' && typeof (body as {message?: unknown;}).message === 'string' ?
        (body as {message: string;}).message :
        `HTTP ${xhr.status}`;
        reject(new ApiError(xhr.status, codeFromStatus(xhr.status), message));
      }
    };

    const form = new FormData();
    form.append('type', type);
    form.append('file', file);
    xhr.send(form);
  });
}

export function uploadDocument(
  token: string,
  applicationId: string,
  type: string,
  file: File,
  options: UploadOptions = {}
) {
  return uploadWithProgress(
    'POST',
    `${API_URL}/applications/${applicationId}/documents`,
    token,
    type,
    file,
    options
  );
}

export function replaceDocument(
  token: string,
  applicationId: string,
  documentId: string,
  type: string,
  file: File,
  options: UploadOptions = {}
) {
  return uploadWithProgress(
    'PUT',
    `${API_URL}/applications/${applicationId}/documents/${documentId}`,
    token,
    type,
    file,
    options
  );
}

export async function fetchDocumentPreviewUrl(
  token: string,
  applicationId: string,
  documentId: string
): Promise<string> {
  const res = await fetch(`${API_URL}/applications/${applicationId}/documents/${documentId}/file`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new ApiError(res.status, codeFromStatus(res.status), `HTTP ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
