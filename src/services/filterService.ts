import type { CreateSavedFilterPayload, SavedFilter } from '@/types/advanced';

import api from './api';

/**
 * 获取保存的筛选视图列表
 */
export async function getSavedFilters(): Promise<SavedFilter[]> {
  const response = await api.get('/api/saved-filters');
  return response.data.items;
}

/**
 * 创建保存筛选视图
 */
export async function createSavedFilter(payload: CreateSavedFilterPayload): Promise<SavedFilter> {
  const response = await api.post('/api/saved-filters', payload);
  return response.data.data;
}

/**
 * 删除保存筛选视图
 */
export async function deleteSavedFilter(id: number): Promise<void> {
  await api.delete(`/api/saved-filters/${id}`);
}
