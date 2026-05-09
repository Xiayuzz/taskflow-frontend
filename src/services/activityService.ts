import type { ActivityLog } from '@/types/advanced';
import type { PaginatedResult } from '@/types/models';

import api from './api';

/**
 * 获取活动日志
 */
export async function getActivities(params?: {
  page?: number;
  pageSize?: number;
  userId?: number;
  targetType?: string;
  targetId?: number;
}): Promise<PaginatedResult<ActivityLog>> {
  const response = await api.get('/api/activities', { params });
  return response.data;
}
