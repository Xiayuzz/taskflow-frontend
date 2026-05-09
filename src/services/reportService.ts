import type { ReportOverview, ReportTrendItem, TeamPerformanceItem } from '@/types/advanced';

import api from './api';

/**
 * 获取任务概览统计
 */
export async function getReportOverview(params: {
  startDate: string;
  endDate: string;
  userId?: number;
  groupId?: number;
}): Promise<ReportOverview> {
  const response = await api.get('/api/reports/overview', { params });
  return response.data.data;
}

/**
 * 获取任务趋势图数据
 */
export async function getReportTrend(params: {
  startDate: string;
  endDate: string;
  dimension: 'day' | 'week' | 'month';
  userId?: number;
  groupId?: number;
}): Promise<ReportTrendItem[]> {
  const response = await api.get('/api/reports/trend', { params });
  return response.data.items;
}

/**
 * 获取团队工时/绩效统计
 */
export async function getTeamPerformance(): Promise<TeamPerformanceItem[]> {
  const response = await api.get('/api/reports/team-performance');
  return response.data.items;
}
