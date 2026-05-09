import api from '@/services/api';
import type {
  TaskCompletionTimeStats,
  TaskOverviewStats,
  UserPerformanceStats,
} from '@/types/models';

// 统计周期类型
export type StatisticPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 任务概览统计请求参数
export interface TaskOverviewParams {
  period?: StatisticPeriod;
  startDate?: string;
  endDate?: string;
}

// 用户绩效统计请求参数
export interface UserPerformanceParams {
  period?: StatisticPeriod;
  userId?: number;
  teamId?: number;
}

// 任务完成时间统计请求参数
export interface TaskCompletionTimeParams {
  period?: StatisticPeriod;
  groupBy?: 'priority' | 'status' | 'assignee' | 'tag';
}

/**
 * 获取任务概览统计
 */
export async function getTaskOverviewStats(
  params?: TaskOverviewParams
): Promise<TaskOverviewStats> {
  const { data } = await api.get('/api/stats/tasks/overview', { params });
  return data;
}

/**
 * 获取用户绩效统计
 */
export async function getUserPerformanceStats(
  params?: UserPerformanceParams
): Promise<UserPerformanceStats[]> {
  const { data } = await api.get('/api/stats/users/performance', { params });
  return data.items;
}

/**
 * 获取任务完成时间统计
 */
export async function getTaskCompletionTimeStats(
  params?: TaskCompletionTimeParams
): Promise<TaskCompletionTimeStats> {
  const { data } = await api.get('/api/stats/tasks/completion-time', { params });
  return data.data || data;
}

