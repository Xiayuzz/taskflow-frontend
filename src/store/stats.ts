import { defineStore } from 'pinia';

import type {
  DashboardStats,
  TaskCompletionTimeStats,
  TaskOverviewStats,
  UserPerformanceStats,
} from '@/types/models';

interface State {
  // 任务概览统计
  taskOverviewStats: TaskOverviewStats | null;
  taskOverviewLoading: boolean;

  // 用户绩效统计
  userPerformanceStats: UserPerformanceStats[];
  userPerformanceLoading: boolean;

  // 任务完成时间统计
  taskCompletionTimeStats: TaskCompletionTimeStats | null;
  taskCompletionTimeLoading: boolean;

  // 仪表盘统计
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
}

export const useStatsStore = defineStore('stats', {
  state: (): State => ({
    // 任务概览统计
    taskOverviewStats: null,
    taskOverviewLoading: false,

    // 用户绩效统计
    userPerformanceStats: [],
    userPerformanceLoading: false,

    // 任务完成时间统计
    taskCompletionTimeStats: null,
    taskCompletionTimeLoading: false,

    // 仪表盘统计
    dashboardStats: null,
    dashboardLoading: false,
  }),
  actions: {
    // 任务概览统计
    setTaskOverviewStats(stats: TaskOverviewStats) {
      this.taskOverviewStats = stats;
    },
    setTaskOverviewLoading(loading: boolean) {
      this.taskOverviewLoading = loading;
    },
    clearTaskOverviewStats() {
      this.taskOverviewStats = null;
    },

    // 用户绩效统计
    setUserPerformanceStats(stats: UserPerformanceStats[]) {
      this.userPerformanceStats = stats;
    },
    setUserPerformanceLoading(loading: boolean) {
      this.userPerformanceLoading = loading;
    },
    clearUserPerformanceStats() {
      this.userPerformanceStats = [];
    },

    // 任务完成时间统计
    setTaskCompletionTimeStats(stats: TaskCompletionTimeStats) {
      this.taskCompletionTimeStats = stats;
    },
    setTaskCompletionTimeLoading(loading: boolean) {
      this.taskCompletionTimeLoading = loading;
    },
    clearTaskCompletionTimeStats() {
      this.taskCompletionTimeStats = null;
    },

    // 仪表盘统计
    setDashboardStats(stats: DashboardStats) {
      this.dashboardStats = stats;
    },
    setDashboardLoading(loading: boolean) {
      this.dashboardLoading = loading;
    },
    clearDashboardStats() {
      this.dashboardStats = null;
    },

    // 清除所有统计数据
    clearAllStats() {
      this.clearTaskOverviewStats();
      this.clearUserPerformanceStats();
      this.clearTaskCompletionTimeStats();
      this.clearDashboardStats();
    },
  },
});
