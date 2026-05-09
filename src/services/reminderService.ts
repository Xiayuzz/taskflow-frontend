import api from './api';

export interface Reminder {
  id: number;
  taskId: number;
  taskTitle: string;
  remindAt: string;
  isSent: boolean;
  createdAt: string;
}

/**
 * 获取提醒列表
 */
export async function getReminders(): Promise<Reminder[]> {
  const response = await api.get('/api/reminders');
  return response.data.items;
}

/**
 * 创建提醒
 */
export async function createReminder(data: {
  taskId: number;
  remindAt: string;
}): Promise<Reminder> {
  const response = await api.post('/api/reminders', data);
  return response.data.data;
}

/**
 * 删除提醒
 */
export async function deleteReminder(id: number): Promise<void> {
  await api.delete(`/api/reminders/${id}`);
}
