import { apiRequest, type ApiErrorCode } from '@/shared/api/client';

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

function mapAuthErrorCode(status: number): ApiErrorCode {
  if (status === 409) return 'email_taken';
  if (status === 401) return 'invalid_credentials';
  if (status === 400) return 'validation';
  return 'generic';
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    mapErrorCode: mapAuthErrorCode,
  });
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    mapErrorCode: mapAuthErrorCode,
  });
}

export function fetchMe(token: string) {
  return apiRequest<AuthUser>('/auth/me', { token });
}
