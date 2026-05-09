<template>
  <div class="activity-page">
    <div class="header">
      <h1>活动日志</h1>
    </div>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="activities"
        style="width: 100%"
      >
        <el-table-column
          label="时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="用户"
          width="120"
          prop="userName"
        />
        <el-table-column
          label="动作"
          width="120"
        >
          <template #default="{ row }">
            <el-tag size="small">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="对象类型"
          width="120"
          prop="targetType"
        />
        <el-table-column
          label="详情"
          min-width="300"
        >
          <template #default="{ row }">
            <span>{{ row.details }}</span>
            <span
              v-if="row.targetName"
              class="target-name"
            >
              (ID: {{ row.targetId }} - {{ row.targetName }})
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';

import { getActivities } from '@/services/activityService';
import type { ActivityLog } from '@/types/advanced';

const loading = ref(false);
const activities = ref<ActivityLog[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);

async function loadData() {
  loading.value = true;
  try {
    const res = await getActivities({
      page: page.value,
      pageSize: pageSize.value,
    });
    activities.value = res.items;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载日志失败');
  } finally {
    loading.value = false;
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage;
  loadData();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.activity-page {
  padding: 20px;
}
.header {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.target-name {
  color: #909399;
  font-size: 12px;
  margin-left: 5px;
}
</style>
