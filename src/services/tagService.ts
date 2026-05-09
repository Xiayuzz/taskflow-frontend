import type { TagStats } from '@/types/advanced';
import type { PaginatedResult, TaskTag } from '@/types/models';

import api from './api';

/**
 * 获取单个标签（根据后端API，这个端点可能不存在，保留作为扩展）
 */
export async function getTagById(id: number): Promise<TaskTag> {
  const response = await api.get(`/api/tags/${id}`);
  return response.data;
}

/**
 * 获取标签列表（分页）
 */
export async function getTags(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<PaginatedResult<TaskTag>> {
  const response = await api.get('/api/tags', { params });
  return response.data;
}

/**
 * 创建标签
 */
export async function createTag(tag: { name: string; color: string }): Promise<TaskTag> {
  const response = await api.post('/api/tags', tag);
  return response.data;
}

/**
 * 更新标签
 */
export async function updateTag(
  id: number,
  tag: {
    name?: string;
    color?: string;
  }
): Promise<TaskTag> {
  const response = await api.put(`/api/tags/${id}`, tag);
  return response.data;
}

/**
 * 删除标签
 */
export async function deleteTag(id: number): Promise<void> {
  await api.delete(`/api/tags/${id}`);
}

/**
 * 批量删除标签
 */
export async function deleteTags(ids: number[]): Promise<void> {
  await api.delete('/api/tags', { data: { ids } });
}

/**
 * 获取任务的标签
 */
export async function getTaskTags(taskId: number): Promise<TaskTag[]> {
  const response = await api.get(`/api/tasks/${taskId}/tags`);
  return response.data;
}

/**
 * 添加标签到任务
 */
export async function addTagToTask(taskId: number, tagId: number): Promise<void> {
  await api.post(`/api/tasks/${taskId}/tags`, { tagId });
}

/**
 * 从任务中移除标签
 */
export async function removeTagFromTask(taskId: number, tagId: number): Promise<void> {
  await api.delete(`/api/tasks/${taskId}/tags/${tagId}`);
}

/**
 * 更新任务的标签
 */
export async function updateTaskTags(taskId: number, tagIds: number[]): Promise<void> {
  await api.put(`/api/tasks/${taskId}/tags`, { tagIds });
}

/**
 * 获取标签统计信息
 */
export async function getTagStats(): Promise<TagStats[]> {
  const response = await api.get('/api/tags/stats');
  return response.data.items;
}

/**
 * 合并标签
 */
export async function mergeTags(
  sourceTagId: number,
  targetTagId: number
): Promise<{ mergedCount: number }> {
  const response = await api.post('/api/tags/merge', { sourceTagId, targetTagId });
  return response.data.data;
}

/**
 * 批量更新标签
 */
export async function batchUpdateTags(ids: number[], data: { color?: string }): Promise<void> {
  await api.put('/api/tags/batch', { ids, data });
}
