<template>
  <div class="page-container">
    <div class="header">
      <h1>群组任务聚合</h1>
      <div class="filters">
        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          clearable
          @change="loadData"
        >
          <el-option
            label="待处理"
            value="pending"
          />
          <el-option
            label="进行中"
            value="in_progress"
          />
          <el-option
            label="已完成"
            value="completed"
          />
        </el-select>
      </div>
    </div>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="tasks"
        style="width: 100%"
        border
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="title"
          label="任务标题"
          min-width="200"
        >
          <template #default="{ row }">
            <router-link
              :to="`/tasks/${row.id}`"
              class="link"
              >{{ row.title }}</router-link
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="groupName"
          label="所属群组"
          width="150"
        >
          <template #default="{ row }">
            <router-link
              :to="`/groups/${row.groupId}`"
              class="link"
              >{{ row.groupName }}</router-link
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          label="优先级"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{
              getPriorityText(row.priority)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="assigneeName"
          label="负责人"
          width="120"
        />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
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

import { getAllGroupTasks } from '@/services/groupService';

const loading = ref(false);
const tasks = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const filterStatus = ref('');

async function loadData() {
  loading.value = true;
  try {
    const res = await getAllGroupTasks({
      page: page.value,
      pageSize: pageSize.value,
      status: filterStatus.value || undefined,
    });
    tasks.value = res.items;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载群组任务失败');
  } finally {
    loading.value = false;
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage;
  loadData();
}

function getStatusType(status: string) {
  return status === 'completed' || status === 'done'
    ? 'success'
    : status === 'in_progress'
      ? 'warning'
      : 'info';
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    done: '已完成',
  };
  return map[status] || status;
}

function getPriorityType(priority: string) {
  return priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'info';
}

function getPriorityText(priority: string) {
  const map: Record<string, string> = { low: '低', medium: '中', high: '高' };
  return map[priority] || priority;
}

function formatTime(time: string) {
  return new Date(time).toLocaleString();
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.link {
  color: #409eff;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
