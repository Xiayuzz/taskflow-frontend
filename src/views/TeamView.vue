<template>
  <div class="page-container">
    <div class="header">
      <h1>团队成员</h1>
    </div>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="members"
        style="width: 100%"
      >
        <el-table-column
          label="成员"
          width="250"
        >
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar
                :size="40"
                :src="row.avatar"
              >
                {{ row.name.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-detail">
                <div class="user-name">{{ row.name }}</div>
                <div class="user-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="角色"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理员' : '成员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="120"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              effect="dark"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="最后活跃"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTime(row.lastActiveAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';

import { getTeamMembers, type TeamMember } from '@/services/teamService';

const loading = ref(false);
const members = ref<TeamMember[]>([]);

async function loadData() {
  loading.value = true;
  try {
    members.value = await getTeamMembers();
  } catch (error) {
    ElMessage.error('加载团队成员失败');
  } finally {
    loading.value = false;
  }
}

function getStatusType(status: string) {
  switch (status) {
    case 'online':
    case 'active':
      return 'success';
    case 'busy':
      return 'warning';
    default:
      return 'info';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'online':
    case 'active':
      return '在线';
    case 'busy':
      return '忙碌';
    default:
      return '离线';
  }
}

function formatTime(time: string) {
  if (!time) return '-';
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
  margin-bottom: 20px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-name {
  font-weight: 500;
  color: #303133;
}
.user-email {
  font-size: 12px;
  color: #909399;
}
</style>
