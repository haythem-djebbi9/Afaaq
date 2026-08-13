import { apiRequest } from '@/shared/api/client';

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  meta: Record<string, unknown> | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function listNotifications(token: string) {
  return apiRequest<{ items: AppNotification[]; unreadCount: number }>('/notifications', { token });
}

export function markNotificationRead(token: string, id: string) {
  return apiRequest<{ success: boolean }>(`/notifications/${id}/read`, { token, method: 'POST' });
}

export function markAllNotificationsRead(token: string) {
  return apiRequest<{ success: boolean }>('/notifications/read-all', { token, method: 'POST' });
}
