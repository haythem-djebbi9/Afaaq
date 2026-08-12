import { API_URL, ApiError } from './api';
import type { FormConfig } from '../types/formConfig';
import type { BackendCountryCode, BackendServiceType } from './applicationsApi';

export async function fetchFormConfig(
  token: string,
  service: BackendServiceType,
  country: BackendCountryCode
): Promise<FormConfig> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/form-config?service=${service}&country=${country}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {
    throw new ApiError(0, 'network', 'network');
  }

  if (!res.ok) {
    throw new ApiError(res.status, 'generic', `HTTP ${res.status}`);
  }

  return res.json() as Promise<FormConfig>;
}
