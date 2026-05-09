<template>
  <div class="page-container">
    <div class="header">
      <h1>提醒设置</h1>
      <el-button
        type="primary"
        @click="openCreate"
        >新建提醒</el-button
      >
    </div>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="reminders"
        style="width: 100%"
      >
        <el-table-column
          prop="taskTitle"
          label="关联任务"
          min-width="200"
        >
          <template #default="{ row }">
            <router-link
              :to="`/tasks/${row.taskId}`"
              class="link"
              >{{ row.taskTitle }}</router-link
            >
          </template>
        </el-table-column>
        <el-table-column
          label="提醒时间"
          width="200"
        >
          <template #default="{ row }">
            {{ formatTime(row.remindAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.isSent ? 'success' : 'warning'">
              {{ row.isSent ? '已发送' : '待发送' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
        >
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="新建提醒"
      width="400px"
    >
      <el-form
        :model="form"
        label-width="80px"
      >
        <el-form-item label="任务">
          <el-select
            v-model="form.taskId"
            placeholder="请选择任务"
            filterable
            remote
            :remote-method="searchTasks"
            :loading="taskLoading"
          >
            <el-option
              v-for="task in taskOptions"
              :key="task.id"
              :label="task.title"
              :value="task.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒时间">
          <el-date-picker
            v-model="form.remindAt"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
            :disabled-date="disabledDate"
            :disabled-hours="disabledHours"
            :disabled-minutes="disabledMinutes"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitCreate"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

import {
  createReminder,
  deleteReminder,
  getReminders,
  type Reminder,
} from '@/services/reminderService';
import { fetchTasks } from '@/services/taskService';
import type { Task } from '@/types/models';

const loading = ref(false);
const reminders = ref<Reminder[]>([]);
const dialogVisible = ref(false);
const taskLoading = ref(false);
const taskOptions = ref<Task[]>([]);
const form = reactive({
  taskId: undefined as number | undefined,
  remindAt: '',
});

async function loadData() {
  loading.value = true;
  try {
    reminders.value = await getReminders();
  } catch (error) {
    ElMessage.error('加载提醒失败');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.taskId = undefined;
  form.remindAt = '';
  dialogVisible.value = true;
  searchTasks('');
}

async function searchTasks(query: string) {
  taskLoading.value = true;
  try {
    const result = await fetchTasks({
      page: 1,
      pageSize: 20,
      keyword: query,
    });
    taskOptions.value = result.items;
  } catch (error) {
    ElMessage.error('加载任务列表失败');
  } finally {
    taskLoading.value = false;
  }
}

async function submitCreate() {
  if (!form.taskId || !form.remindAt) return ElMessage.warning('请填写完整信息');
  try {
    await createReminder({ taskId: form.taskId, remindAt: form.remindAt });
    ElMessage.success('创建成功');
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    ElMessage.error('创建失败');
  }
}

function handleDelete(row: Reminder) {
  ElMessageBox.confirm('确定删除该提醒吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteReminder(row.id);
      ElMessage.success('删除成功');
      loadData();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
}

function formatTime(time: string) {
  return new Date(time).toLocaleString();
}

function disabledDate(date: Date) {
  return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
}

function disabledHours() {
  const now = new Date();
  const selectedDate = form.remindAt ? new Date(form.remindAt) : null;
  if (!selectedDate || selectedDate.toDateString() !== now.toDateString()) {
    return [];
  }
  const hours: number[] = [];
  for (let i = 0; i < now.getHours(); i++) {
    hours.push(i);
  }
  return hours;
}

function disabledMinutes(hour: number) {
  const now = new Date();
  const selectedDate = form.remindAt ? new Date(form.remindAt) : null;
  if (
    !selectedDate ||
    selectedDate.toDateString() !== now.toDateString() ||
    hour !== now.getHours()
  ) {
    return [];
  }
  const minutes: number[] = [];
  for (let i = 0; i <= now.getMinutes(); i++) {
    minutes.push(i);
  }
  return minutes;
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
</style>
