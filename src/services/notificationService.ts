import type { Notification, PaginatedResult } from '@/types/models';

import api from './api';

export async function getNotifications(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
}): Promise<PaginatedResult<Notification>> {
  const response = await api.get('/api/inbox/notifications', { params });
  return response.data.data;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await api.put(`/api/inbox/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const response = await api.put('/api/inbox/notifications/read-all');
  if (response.data.data && response.data.data.data) {
    return response.data.data.data;
  }
  return response.data.data;
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/api/inbox/notifications/${id}`);
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  const response = await api.get('/api/inbox/notifications/unread-count');
  if (response.data.data && response.data.data.data) {
    return response.data.data.data;
  }
  return response.data.data;
}

export async function sendNotification(data: {
  userId: number;
  type: string;
  title: string;
  content: string;
  relatedId?: number;
  relatedType?: string;
}): Promise<Notification> {
  const response = await api.post('/api/inbox/notifications', data);
  if (response.data.data && response.data.data.data) {
    return response.data.data.data;
  }
  return response.data.data;
}
