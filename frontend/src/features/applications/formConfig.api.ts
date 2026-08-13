import { apiRequest } from '@/shared/api/client';
import type { FormConfig } from '@/shared/types/formConfig';
import type { BackendCountryCode, BackendServiceType } from '@/features/applications/applications.api';

export function fetchFormConfig(
  token: string,
  service: BackendServiceType,
  country: BackendCountryCode
): Promise<FormConfig> {
  return apiRequest<FormConfig>(`/form-config?service=${service}&country=${country}`, { token });
}
