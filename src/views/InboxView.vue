<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">收件箱</h1>
      <div>
        <el-button
          type="primary"
          @click="markAllAsRead"
          :disabled="notifications.length === 0"
        >
          全部已读
        </el-button>
      </div>
    </div>

    <div class="mb-6 flex flex-wrap gap-4">
      <el-select
        v-model="filterType"
        placeholder="按类型筛选"
        class="w-48"
        @change="handleFilterChange"
      >
        <el-option
          label="全部类型"
          value=""
        />
        <el-option
          label="任务分配"
          value="task_assigned"
        />
        <el-option
          label="任务到期"
          value="task_deadline"
        />
        <el-option
          label="任务完成"
          value="task_completed"
        />
        <el-option
          label="任务评论"
          value="task_comment"
        />
        <el-option
          label="群组邀请"
          value="group_invitation"
        />
        <el-option
          label="群组任务分配"
          value="group_task_assigned"
        />
        <el-option
          label="系统通知"
          value="system_notification"
        />
      </el-select>
      <el-select
        v-model="filterStatus"
        placeholder="按状态筛选"
        class="w-48"
        @change="handleFilterChange"
      >
        <el-option
          label="全部状态"
          value=""
        />
        <el-option
          label="未读"
          value="unread"
        />
        <el-option
          label="已读"
          value="read"
        />
      </el-select>
    </div>

    <el-empty
      v-if="!loading && notifications.length === 0"
      description="暂无通知"
    />

    <el-table
      v-else
      v-loading="loading"
      :data="notifications"
      style="width: 100%"
      border
    >
      <el-table-column
        prop="id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="type"
        label="类型"
        width="150"
      >
        <template #default="scope">
          <el-tag :type="getTypeColor(scope.row.type)">
            {{ getTypeName(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="标题"
        min-width="200"
      >
        <template #default="scope">
          <span
            v-if="scope.row.relatedId"
            class="cursor-pointer text-blue-600 hover:text-blue-800"
            @click="handleView(scope.row)"
          >
            {{ scope.row.title }}
          </span>
          <span v-else>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="内容"
        min-width="300"
      />
      <el-table-column
        prop="isRead"
        label="状态"
        width="100"
      >
        <template #default="scope">
          <el-tag :type="scope.row.isRead ? 'success' : 'warning'">
            {{ scope.row.isRead ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        label="创建时间"
        width="180"
      >
        <template #default="scope">
          {{ formatTime(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-if="scope.row.relatedId"
            type="info"
            size="small"
            @click="handleView(scope.row)"
            class="mr-2"
          >
            查看
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="markAsRead(scope.row.id)"
            :disabled="scope.row.isRead"
            class="mr-2"
          >
            标记已读
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="deleteNotification(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4 flex justify-center">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  deleteNotification as deleteNotificationApi,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/services/notificationService';
import type { Notification } from '@/types/models';

const router = useRouter();
const loading = ref(false);
const notifications = ref<Notification[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterType = ref('');
const filterStatus = ref('');
const unreadCount = ref(0);

function formatTime(time: string) {
  return time.replace('T', ' ').substring(0, 19);
}

function getTypeName(type: string) {
  const typeMap: Record<string, string> = {
    task_assigned: '任务分配',
    task_deadline: '任务即将到期',
    task_completed: '任务已完成',
    task_comment: '任务新评论',
    group_invitation: '群组邀请',
    group_task_assigned: '群组任务分配',
    system_notification: '系统通知',
  };
  return typeMap[type] || type;
}

async function handleView(notification: Notification) {
  if (!notification.isRead) {
    await markAsRead(notification.id);
  }
  if (notification.relatedType === 'task' && notification.relatedId) {
    router.push(`/tasks/${notification.relatedId}`);
  } else if (notification.relatedType === 'group' && notification.relatedId) {
    router.push(`/groups/${notification.relatedId}`);
  }
}

function getTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    task_assigned: 'primary',
    task_deadline: 'danger',
    task_completed: 'success',
    task_comment: 'info',
    group_invitation: 'warning',
    group_task_assigned: 'warning',
    system_notification: 'info',
  };
  return colorMap[type] as 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

async function loadNotifications() {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    };
    if (filterType.value) {
      params.type = filterType.value;
    }
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    const result = await getNotifications(params);
    notifications.value = result.items;
    total.value = result.total;
    // 加载未读数量
    const countResult = await getUnreadNotificationCount();
    unreadCount.value = countResult.count;
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '加载通知失败');
  } finally {
    loading.value = false;
  }
}

async function markAsRead(id: number) {
  try {
    await markNotificationAsRead(id);
    ElMessage.success('标记已读成功');
    // 更新本地状态
    const notification = notifications.value.find((n) => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
    // 更新未读数量
    const countResult = await getUnreadNotificationCount();
    unreadCount.value = countResult.count;
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '标记已读失败');
  }
}

async function markAllAsRead() {
  try {
    await ElMessageBox.confirm('确定要将所有通知标记为已读吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });
    const result = await markAllNotificationsAsRead();
    ElMessage.success(`已将 ${result.count} 条通知标记为已读`);
    loadNotifications();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '标记全部已读失败');
    }
  }
}

async function deleteNotification(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除此通知吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await deleteNotificationApi(id);
    ElMessage.success('通知删除成功');
    // 从本地移除
    notifications.value = notifications.value.filter((n) => n.id !== id);
    total.value--;
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '删除通知失败');
    }
  }
}

function handleFilterChange() {
  page.value = 1;
  loadNotifications();
}

function handleSizeChange(val: number) {
  pageSize.value = val;
  page.value = 1;
  loadNotifications();
}

function handleCurrentChange(val: number) {
  page.value = val;
  loadNotifications();
}

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.el-table {
  margin-top: 20px;
}

.el-pagination {
  margin-top: 20px;
}
</style>
