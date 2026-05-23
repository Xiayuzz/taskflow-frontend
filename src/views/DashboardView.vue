<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-semibold">仪表盘</h1>

    <!-- 统计卡片 -->
    <el-card
      shadow="never"
      class="stats-cards"
    >
      <template #header>
        <div class="card-head">统计概览</div>
      </template>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <el-card
          v-for="card in dashboardStats.cards"
          :key="card.id"
          shadow="hover"
          class="stat-card"
        >
          <div class="stat-header">
            <span class="stat-title">{{ card.title }}</span>
            <el-tag
              :type="card.changeType === 'increase' ? 'success' : 'danger'"
              size="small"
              :effect="'light'"
            >
              {{ card.changeType === 'increase' ? '+' : '-' }}{{ card.change }}%
              <span class="text-xs">({{ card.period }})</span>
            </el-tag>
          </div>
          <div class="stat-value">{{ card.value }}</div>
        </el-card>
      </div>

      <!-- 快速统计信息 -->
      <div class="quick-stats mt-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div class="quick-stat-item">
            <span class="quick-stat-label">今日任务</span>
            <span class="quick-stat-value">{{ dashboardStats.quickStats.todayTasks }}</span>
          </div>
          <div class="quick-stat-item">
            <span class="quick-stat-label">本周任务</span>
            <span class="quick-stat-value">{{ dashboardStats.quickStats.thisWeekTasks }}</span>
          </div>
          <div class="quick-stat-item">
            <span class="quick-stat-label">本月任务</span>
            <span class="quick-stat-value">{{ dashboardStats.quickStats.thisMonthTasks }}</span>
          </div>
          <div class="quick-stat-item">
            <span class="quick-stat-label">我的待办</span>
            <span class="quick-stat-value">{{ dashboardStats.quickStats.myPendingTasks }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 任务状态分布 -->
      <el-card
        shadow="never"
        class="chart-card"
      >
        <template #header>
          <div class="card-head">任务状态分布</div>
        </template>
        <div
          ref="statusChartRef"
          class="w-full h-64"
          aria-label="任务状态分布图表"
        ></div>
      </el-card>

      <!-- 任务优先级分布 -->
      <el-card
        shadow="never"
        class="chart-card"
      >
        <template #header>
          <div class="card-head">任务优先级分布</div>
        </template>
        <div
          ref="priorityChartRef"
          class="w-full h-64"
          aria-label="任务优先级分布图表"
        ></div>
      </el-card>

      <!-- 任务趋势 -->
      <el-card
        shadow="never"
        class="chart-card lg:col-span-2"
      >
        <template #header>
          <div class="card-head">任务趋势</div>
        </template>
        <div
          ref="trendChartRef"
          class="w-full h-64"
          aria-label="任务趋势图表"
        ></div>
      </el-card>

      <!-- 任务标签分布 -->
      <el-card
        shadow="never"
        class="chart-card lg:col-span-2"
      >
        <template #header>
          <div class="card-head">任务标签分布</div>
        </template>
        <div
          ref="tagChartRef"
          class="w-full h-64"
          aria-label="任务标签分布图表"
        ></div>
      </el-card>

      <!-- 用户绩效图表 -->
      <el-card
        shadow="never"
        class="chart-card"
      >
        <template #header>
          <div class="card-head">用户绩效</div>
        </template>
        <div
          ref="userPerformanceChartRef"
          class="w-full h-64"
          aria-label="用户绩效图表"
        ></div>
      </el-card>

      <!-- 任务分配图表 -->
      <el-card
        shadow="never"
        class="chart-card"
      >
        <template #header>
          <div class="card-head">任务分配</div>
        </template>
        <div
          ref="taskAssignmentChartRef"
          class="w-full h-64"
          aria-label="任务分配图表"
        ></div>
      </el-card>

      <!-- 任务实际工时图表 -->
      <el-card
        shadow="never"
        class="chart-card lg:col-span-2"
      >
        <template #header>
          <div class="card-head">任务实际工时</div>
        </template>
        <div
          ref="taskCompletionTimeChartRef"
          class="w-full h-64"
          aria-label="任务实际工时图表"
        ></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import {
  getTaskCompletionTimeStats,
  getTaskOverviewStats,
  getUserPerformanceStats,
} from '@/services/statsService';
import { toast } from '@/services/toast';
import { off as offSocket, on as onSocket } from '@/services/websocket';
import type {
  TaskCompletionTimeStats,
  TaskOverviewStats,
  UserPerformanceStats,
} from '@/types/models';

// 图表引用
const statusChartRef = ref<HTMLDivElement | null>(null);
const priorityChartRef = ref<HTMLDivElement | null>(null);
const trendChartRef = ref<HTMLDivElement | null>(null);
const tagChartRef = ref<HTMLDivElement | null>(null);
const userPerformanceChartRef = ref<HTMLDivElement | null>(null);
const taskAssignmentChartRef = ref<HTMLDivElement | null>(null);
const taskCompletionTimeChartRef = ref<HTMLDivElement | null>(null);

// 图表实例
let statusChart: echarts.ECharts | null = null;
let priorityChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;
let tagChart: echarts.ECharts | null = null;
let userPerformanceChart: echarts.ECharts | null = null;
let taskAssignmentChart: echarts.ECharts | null = null;
let taskCompletionTimeChart: echarts.ECharts | null = null;
let statsRefreshTimer: number | null = null;

interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change: number;
  changeType: 'increase' | 'decrease';
  period: string;
}

interface QuickStats {
  todayTasks: number;
  thisWeekTasks: number;
  thisMonthTasks: number;
  myPendingTasks: number;
}

// 仪表盘统计数据
const dashboardStats = ref<{ cards: DashboardCard[]; quickStats: QuickStats }>({
  cards: [
    {
      id: 'total_tasks',
      title: '总任务数',
      value: 0,
      icon: 'tasks',
      color: '#2196F3',
      change: 0,
      changeType: 'increase',
      period: 'week',
    },
    {
      id: 'completed_tasks',
      title: '已完成任务',
      value: 0,
      icon: 'check-circle',
      color: '#4CAF50',
      change: 0,
      changeType: 'increase',
      period: 'week',
    },
    {
      id: 'overdue_tasks',
      title: '逾期任务',
      value: 0,
      icon: 'alert-triangle',
      color: '#FF9800',
      change: 0,
      changeType: 'decrease',
      period: 'week',
    },
    {
      id: 'avg_completion_rate',
      title: '平均完成率',
      value: '0%',
      icon: 'pie-chart',
      color: '#9C27B0',
      change: 0,
      changeType: 'increase',
      period: 'month',
    },
  ],
  quickStats: {
    todayTasks: 0,
    thisWeekTasks: 0,
    thisMonthTasks: 0,
    myPendingTasks: 0,
  },
});

// 任务概览统计数据
const taskOverviewStats = ref<TaskOverviewStats>({
  overview: {
    total: 0,
    pending: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  },
  byPriority: {
    low: 0,
    medium: 0,
    high: 0,
  },
  byStatus: {
    pending: 0,
    inProgress: 0,
    done: 0,
  },
  trend: [],
  byTag: {},
});

// 新的统计数据变量
const userPerformanceStats = ref<UserPerformanceStats[]>([]);
const taskCompletionTimeStats = ref<TaskCompletionTimeStats>({
  avgCompletionTime: 0,
  medianCompletionTime: 0,
  byGroup: {
    priority: {
      low: 0,
      medium: 0,
      high: 0,
    },
    status: {
      pending: 0,
      done: 0,
      in_progress: 0,
    },
    assignee: undefined,
    tag: undefined,
  },
  trend: [],
});

// 渲染所有图表
function renderCharts() {
  disposeCharts();
  renderStatusChart();
  renderPriorityChart();
  renderTrendChart();
  renderTagChart();
  renderUserPerformanceChart();
  renderTaskAssignmentChart();
  renderTaskCompletionTimeChart();
}

function disposeCharts() {
  statusChart?.dispose();
  priorityChart?.dispose();
  trendChart?.dispose();
  tagChart?.dispose();
  userPerformanceChart?.dispose();
  taskAssignmentChart?.dispose();
  taskCompletionTimeChart?.dispose();
  statusChart = null;
  priorityChart = null;
  trendChart = null;
  tagChart = null;
  userPerformanceChart = null;
  taskAssignmentChart = null;
  taskCompletionTimeChart = null;
}

// 渲染任务状态分布图表
function renderStatusChart() {
  if (!statusChartRef.value) return;
  statusChart = echarts.init(statusChartRef.value);

  const data = [
    { name: '待处理', value: taskOverviewStats.value.byStatus.pending, color: '#6b8cff' },
    { name: '进行中', value: taskOverviewStats.value.byStatus.inProgress, color: '#5ad0a7' },
    { name: '已完成', value: taskOverviewStats.value.byStatus.done, color: '#ffd36b' },
  ];

  statusChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map((item) => item.name),
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data,
      },
    ],
  });
}

// 渲染任务优先级分布图表
function renderPriorityChart() {
  if (!priorityChartRef.value) return;
  priorityChart = echarts.init(priorityChartRef.value);

  const data = [
    { name: '低', value: taskOverviewStats.value.byPriority.low, color: '#5ad0a7' },
    { name: '中', value: taskOverviewStats.value.byPriority.medium, color: '#ffd36b' },
    { name: '高', value: taskOverviewStats.value.byPriority.high, color: '#ff7875' },
  ];

  priorityChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: data.map((item) => item.value),
        itemStyle: {
          color: function (params: any) {
            return data[params.dataIndex].color;
          },
          borderRadius: [6, 6, 0, 0],
        },
        barWidth: '40%',
      },
    ],
  });
}

// 渲染任务趋势图表
function renderTrendChart() {
  if (!trendChartRef.value) return;
  trendChart = echarts.init(trendChartRef.value);

  const trendData = taskOverviewStats.value.trend;
  const dates = trendData.map((item) => item.date);
  const created = trendData.map((item) => item.created);
  const completed = trendData.map((item) => item.completed);

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['创建', '完成'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
    },
    series: [
      {
        name: '创建',
        type: 'line',
        stack: 'Total',
        data: created,
        smooth: true,
        lineStyle: { color: '#6b8cff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(107, 140, 255, 0.5)' },
            { offset: 1, color: 'rgba(107, 140, 255, 0.1)' },
          ]),
        },
      },
      {
        name: '完成',
        type: 'line',
        stack: 'Total',
        data: completed,
        smooth: true,
        lineStyle: { color: '#5ad0a7' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(90, 208, 167, 0.5)' },
            { offset: 1, color: 'rgba(90, 208, 167, 0.1)' },
          ]),
        },
      },
    ],
  });
}

// 渲染任务标签分布图表
function renderTagChart() {
  if (!tagChartRef.value) return;
  tagChart = echarts.init(tagChartRef.value);

  const tagData = Object.entries(taskOverviewStats.value.byTag)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  tagChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: tagData.map((item) => item.name),
    },
    series: [
      {
        name: '标签',
        type: 'pie',
        radius: '50%',
        data: tagData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  });
}

// 处理窗口大小变化
function handleResize() {
  statusChart?.resize();
  priorityChart?.resize();
  trendChart?.resize();
  tagChart?.resize();
  userPerformanceChart?.resize();
  taskAssignmentChart?.resize();
  taskCompletionTimeChart?.resize();
}

// 渲染用户绩效图表
function renderUserPerformanceChart() {
  if (!userPerformanceChartRef.value) return;
  userPerformanceChart = echarts.init(userPerformanceChartRef.value);

  const users = userPerformanceStats.value.map((stat) => stat.name || `用户${stat.userId}`);
  const completedTasks = userPerformanceStats.value.map((stat) => stat.completedTasks);
  const completionRate = userPerformanceStats.value.map((stat) => stat.completionRate);

  userPerformanceChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['完成任务数', '完成率(%)'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: users,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '完成任务数',
        axisLabel: {
          formatter: '{value}',
        },
      },
      {
        type: 'value',
        name: '完成率(%)',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '完成任务数',
        type: 'bar',
        data: completedTasks,
        itemStyle: {
          color: '#6b8cff',
        },
      },
      {
        name: '完成率(%)',
        type: 'line',
        yAxisIndex: 1,
        data: completionRate,
        itemStyle: {
          color: '#ff7875',
        },
        smooth: true,
      },
    ],
  });
}

// 渲染任务分配图表
function renderTaskAssignmentChart() {
  if (!taskAssignmentChartRef.value) return;
  taskAssignmentChart = echarts.init(taskAssignmentChartRef.value);

  const assignmentData = taskOverviewStats.value.byAssignment || [];
  const assignedTasks = assignmentData.map((user: any) => user.assigned);
  const completedTasks = assignmentData.map((user: any) => user.completed);
  const inProgressTasks = assignmentData.map((user: any) => user.inProgress);

  taskAssignmentChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['已分配', '已完成', '进行中'],
    },
    series: [
      {
        name: '任务分配',
        type: 'pie',
        radius: '70%',
        data: [
          {
            name: '已分配',
            value: assignedTasks.reduce((a: number, b: number) => a + b, 0),
            itemStyle: { color: '#6b8cff' },
          },
          {
            name: '已完成',
            value: completedTasks.reduce((a: number, b: number) => a + b, 0),
            itemStyle: { color: '#5ad0a7' },
          },
          {
            name: '进行中',
            value: inProgressTasks.reduce((a: number, b: number) => a + b, 0),
            itemStyle: { color: '#ffd36b' },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  });
}

// 渲染任务实际工时图表（按日期趋势）
function renderTaskCompletionTimeChart() {
  if (!taskCompletionTimeChartRef.value) return;
  taskCompletionTimeChart = echarts.init(taskCompletionTimeChartRef.value);

  const trendData = taskCompletionTimeStats.value.trend;
  if (!Array.isArray(trendData) || trendData.length === 0) return;

  const dates = trendData.map((item) => item.date);
  const avgTimes = trendData.map((item) => item.avgTime);

  taskCompletionTimeChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>平均实际工时: {c} 小时',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        formatter: (value: string) => value.slice(5),
      },
    },
    yAxis: {
      type: 'value',
      name: '平均实际工时(小时)',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
    },
    series: [
      {
        name: '平均实际工时',
        type: 'line',
        data: avgTimes,
        smooth: true,
        lineStyle: { color: '#6b8cff' },
        itemStyle: { color: '#6b8cff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(107, 140, 255, 0.5)' },
            { offset: 1, color: 'rgba(107, 140, 255, 0.1)' },
          ]),
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}h',
        },
      },
    ],
  });
}

// 初始化数据和图表
async function init(showError = true) {
  try {
    // 并行加载统计数据（overview 已合并趋势、标签、分配等数据）
    const [overviewData, performanceData, completionTimeData] = await Promise.all([
      getTaskOverviewStats(),
      getUserPerformanceStats(),
      getTaskCompletionTimeStats(),
    ]);

    // 更新概览统计
    if (overviewData) {
      taskOverviewStats.value = {
        ...taskOverviewStats.value,
        ...overviewData,
        trend: Array.isArray(overviewData.trend) ? overviewData.trend : [],
        byAssignment: Array.isArray(overviewData.byAssignment) ? overviewData.byAssignment : [],
      };

      // 从 overview 构建仪表盘卡片数据
      const overview = overviewData.overview;
      if (overview) {
        const completionRate =
          overview.total > 0 ? Math.round((overview.done / overview.total) * 100) : 0;
        dashboardStats.value = {
          cards: [
            {
              id: 'total_tasks',
              title: '总任务数',
              value: overview.total,
              icon: 'tasks',
              color: '#2196F3',
              change: 0,
              changeType: 'increase',
              period: 'week',
            },
            {
              id: 'completed_tasks',
              title: '已完成任务',
              value: overview.done,
              icon: 'check-circle',
              color: '#4CAF50',
              change: 0,
              changeType: 'increase',
              period: 'week',
            },
            {
              id: 'overdue_tasks',
              title: '逾期任务',
              value: overview.overdue,
              icon: 'alert-triangle',
              color: '#FF9800',
              change: 0,
              changeType: 'decrease',
              period: 'week',
            },
            {
              id: 'avg_completion_rate',
              title: '平均完成率',
              value: `${completionRate}%`,
              icon: 'pie-chart',
              color: '#9C27B0',
              change: 0,
              changeType: 'increase',
              period: 'month',
            },
          ],
          quickStats: {
            todayTasks: overview.total,
            thisWeekTasks: overview.total,
            thisMonthTasks: overview.total,
            myPendingTasks: overview.pending || 0,
          },
        };
      }
    }

    userPerformanceStats.value = Array.isArray(performanceData) ? performanceData : [];
    taskCompletionTimeStats.value = completionTimeData || taskCompletionTimeStats.value;

    // 渲染图表
    renderCharts();
  } catch (error: any) {
    console.error('Dashboard init error:', error);
    if (showError) {
      toast.error('加载统计数据失败: ' + (error?.response?.data?.message || error.message));
    }
  }
}

function refreshStatsSoon() {
  if (statsRefreshTimer !== null) {
    window.clearTimeout(statsRefreshTimer);
  }
  statsRefreshTimer = window.setTimeout(() => {
    statsRefreshTimer = null;
    init(false);
  }, 300);
}

// 组件挂载时初始化
onMounted(() => {
  init();
  onSocket('task:update', refreshStatsSoon);
  onSocket('task:new', refreshStatsSoon);
  onSocket('task:deleted', refreshStatsSoon);
  onSocket('stats:update', refreshStatsSoon);
  window.addEventListener('resize', handleResize);
});

// 组件卸载前清理
onBeforeUnmount(() => {
  offSocket('task:update', refreshStatsSoon);
  offSocket('task:new', refreshStatsSoon);
  offSocket('task:deleted', refreshStatsSoon);
  offSocket('stats:update', refreshStatsSoon);
  if (statsRefreshTimer !== null) {
    window.clearTimeout(statsRefreshTimer);
    statsRefreshTimer = null;
  }
  try {
    disposeCharts();
  } catch {
    // ignore
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.stat-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 20px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.quick-stats {
  margin-top: 20px;
}

.quick-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.quick-stat-label {
  font-size: 14px;
  color: #606266;
}

.quick-stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.chart-card {
  margin-bottom: 24px;
}

.card-head {
  font-weight: 600;
  font-size: 16px;
}

@media (max-width: 768px) {
  .p-6 {
    padding: 1rem;
  }
  .text-2xl {
    font-size: 1.5rem;
  }
  .space-y-6 > * + * {
    margin-top: 1rem;
  }
  .grid {
    gap: 1rem;
  }
  .stat-card {
    padding: 1rem 0;
  }
  .stat-header {
    padding: 0 0.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .stat-value {
    font-size: 1.5rem;
  }
  .quick-stat-item {
    padding: 0.75rem 1rem;
  }
  .quick-stat-value {
    font-size: 1.25rem;
  }
  .chart-card {
    margin-bottom: 1rem;
  }
  .card-head {
    font-size: 1rem;
  }
  .w-full.h-64 {
    height: 12rem;
  }
}

@media (max-width: 480px) {
  .p-6 {
    padding: 0.75rem;
  }
  .text-2xl {
    font-size: 1.25rem;
  }
  .space-y-6 > * + * {
    margin-top: 0.75rem;
  }
  .grid {
    gap: 0.75rem;
  }
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .md\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .stat-card {
    padding: 0.75rem 0;
  }
  .stat-title {
    font-size: 12px;
  }
  .stat-value {
    font-size: 1.25rem;
  }
  .quick-stat-item {
    padding: 0.5rem 0.75rem;
  }
  .quick-stat-label {
    font-size: 12px;
  }
  .quick-stat-value {
    font-size: 1rem;
  }
  .w-full.h-64 {
    height: 10rem;
  }
}
</style>
