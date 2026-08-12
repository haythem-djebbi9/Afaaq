import { API_URL, ApiError } from './api';

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  meta: Record<string, unknown> | null;
  link: string | null;
  read: boolean;
  createdAt: string;
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
  if (!res.ok) throw new ApiError(res.status, 'generic', `HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function listNotifications(token: string) {
  return request<{items: AppNotification[];unreadCount: number;}>('/notifications', token);
}

export function markNotificationRead(token: string, id: string) {
  return request<{success: boolean;}>(`/notifications/${id}/read`, token, { method: 'POST' });
}

export function markAllNotificationsRead(token: string) {
  return request<{success: boolean;}>('/notifications/read-all', token, { method: 'POST' });
}
