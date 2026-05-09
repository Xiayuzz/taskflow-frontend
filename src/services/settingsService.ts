import type { UserPreferences } from '@/types/advanced';

import api from './api';

/**
 * 获取用户偏好设置
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  const response = await api.get('/api/settings/preferences');
  return response.data.data;
}

/**
 * 更新用户偏好设置
 */
export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
  const response = await api.put('/api/settings/preferences', preferences);
  return response.data.data;
}
