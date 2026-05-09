<template>
  <div class="reports-page">
    <div class="header">
      <h1>统计报表</h1>
      <div class="filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadData"
        />
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-card
        shadow="hover"
        class="card"
      >
        <div class="card-title">创建任务</div>
        <div class="card-value">{{ overview?.totalCreated || 0 }}</div>
      </el-card>
      <el-card
        shadow="hover"
        class="card"
      >
        <div class="card-title">完成任务</div>
        <div class="card-value text-success">{{ overview?.totalCompleted || 0 }}</div>
      </el-card>
      <el-card
        shadow="hover"
        class="card"
      >
        <div class="card-title">完成率</div>
        <div class="card-value text-primary">
          {{ ((overview?.completionRate || 0) * 100).toFixed(1) }}%
        </div>
      </el-card>
      <el-card
        shadow="hover"
        class="card"
      >
        <div class="card-title">平均完成时间</div>
        <div class="card-value">{{ (overview?.avgCompletionTime || 0).toFixed(1) }}h</div>
      </el-card>
    </div>

    <!-- 趋势图 -->
    <el-card
      shadow="never"
      class="chart-card"
    >
      <template #header>任务趋势</template>
      <div
        ref="trendChartRef"
        class="chart-container"
      ></div>
    </el-card>

    <!-- 团队绩效 -->
    <el-card
      shadow="never"
      class="mt-4"
    >
      <template #header>团队绩效</template>
      <el-table
        :data="teamPerformance"
        stripe
      >
        <el-table-column
          prop="userName"
          label="成员"
        />
        <el-table-column
          prop="assignedTasks"
          label="分配任务"
        />
        <el-table-column
          prop="completedTasks"
          label="完成任务"
        />
        <el-table-column
          prop="totalEstimatedHours"
          label="预估工时"
        />
        <el-table-column
          prop="totalActualHours"
          label="实际工时"
        />
        <el-table-column
          label="效率系数"
          width="120"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.efficiency >= 1 ? 'success' : 'warning'"
              effect="dark"
            >
              {{ row.efficiency.toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { getReportOverview, getReportTrend, getTeamPerformance } from '@/services/reportService';
import { toast } from '@/services/toast';
import type { ReportOverview, ReportTrendItem, TeamPerformanceItem } from '@/types/advanced';

const dateRange = ref<[string, string]>(['', '']);
const overview = ref<ReportOverview | null>(null);
const trendData = ref<ReportTrendItem[]>([]);
const teamPerformance = ref<TeamPerformanceItem[]>([]);

const trendChartRef = ref<HTMLDivElement | null>(null);
let trendChart: echarts.ECharts | null = null;

// 设置默认时间范围（最近30天）
function setDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
  dateRange.value = [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
}

async function loadData() {
  if (!dateRange.value || dateRange.value.length < 2) return;
  const [startDate, endDate] = dateRange.value;

  try {
    const [overviewRes, trendRes, performanceRes] = await Promise.all([
      getReportOverview({ startDate, endDate }),
      getReportTrend({ startDate, endDate, dimension: 'day' }),
      getTeamPerformance(),
    ]);

    overview.value = overviewRes || {};
    trendData.value = Array.isArray(trendRes) ? trendRes : [];
    teamPerformance.value = Array.isArray(performanceRes) ? performanceRes : [];

    renderTrendChart();
  } catch (error) {
    toast.error('加载报表数据失败');
  }
}

function renderTrendChart() {
  if (!trendChartRef.value) return;
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value);
  }

  const dates = trendData.value.map((item) => item.date);
  const created = trendData.value.map((item) => item.created);
  const completed = trendData.value.map((item) => item.completed);

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['创建', '完成'] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      { name: '创建', type: 'line', data: created, smooth: true, itemStyle: { color: '#409eff' } },
      {
        name: '完成',
        type: 'line',
        data: completed,
        smooth: true,
        itemStyle: { color: '#67c23a' },
      },
    ],
  });
}

function handleResize() {
  trendChart?.resize();
}

onMounted(() => {
  setDefaultDateRange();
  loadData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  trendChart?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.reports-page {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.overview-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.card {
  flex: 1;
  text-align: center;
}
.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}
.card-value {
  font-size: 24px;
  font-weight: bold;
}
.text-success {
  color: #67c23a;
}
.text-primary {
  color: #409eff;
}
.chart-container {
  width: 100%;
  height: 300px;
}
.mt-4 {
  margin-top: 20px;
}
</style>
