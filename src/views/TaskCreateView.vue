<template>
  <div class="create-task-page">
    <div class="header">
      <h1>创建任务</h1>
    </div>

    <el-card
      shadow="never"
      class="form-card"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="task-form"
      >
        <el-form-item
          label="标题"
          prop="title"
        >
          <el-input
            v-model="form.title"
            placeholder="请输入任务标题"
          />
        </el-form-item>

        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="6"
            placeholder="请输入任务详细描述"
          />
        </el-form-item>

        <el-form-item
          label="指派给"
          prop="assigneeId"
        >
          <el-select
            v-model="form.assigneeId"
            filterable
            remote
            clearable
            placeholder="搜索用户"
            :remote-method="remoteSearchUsers"
            :loading="userLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.name || item.username"
              :value="item.id"
            >
              <span>{{ item.name }} ({{ item.username }})</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.department?.name
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          label="所属群组"
          prop="groupId"
        >
          <el-select
            v-model="form.groupId"
            clearable
            filterable
            placeholder="选择群组"
            style="width: 100%"
          >
            <el-option
              v-for="group in groupList"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>

        <div class="row">
          <el-form-item
            label="优先级"
            prop="priority"
            class="half-width"
          >
            <el-select
              v-model="form.priority"
              placeholder="选择优先级"
            >
              <el-option
                label="高"
                value="high"
              />
              <el-option
                label="中"
                value="medium"
              />
              <el-option
                label="低"
                value="low"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            label="截止时间"
            prop="dueDate"
            class="half-width"
          >
            <el-date-picker
              v-model="form.dueDate"
              type="datetime"
              placeholder="选择截止时间"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <el-form-item
          label="标签"
          prop="tags"
        >
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag.name"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>

        <div class="row">
          <el-form-item
            label="预估工时"
            prop="estimatedHours"
            class="half-width"
          >
            <el-input-number
              v-model="form.estimatedHours"
              :min="0"
              :precision="1"
            />
            <span class="unit">小时</span>
          </el-form-item>
        </div>

        <el-divider content-position="left">提醒设置</el-divider>

        <div class="row">
          <el-form-item
            label="开启提醒"
            prop="isReminderOn"
          >
            <el-switch v-model="form.isReminderOn" />
          </el-form-item>

          <el-form-item
            v-if="form.isReminderOn"
            label="提醒时间"
            prop="reminderTime"
          >
            <el-date-picker
              v-model="form.reminderTime"
              type="datetime"
              placeholder="选择提醒时间"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
            />
          </el-form-item>
        </div>

        <el-form-item class="actions">
          <el-button
            type="primary"
            :loading="submitting"
            @click="submit"
            >立即创建</el-button
          >
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getGroups } from '@/services/groupService';
import { createTask, fetchTaskTags } from '@/services/taskService';
import { searchUsers } from '@/services/userService';
import type { Group, TaskPriority, User } from '@/types/models';

const router = useRouter();
const formRef = ref<FormInstance>();
const submitting = ref(false);
const availableTags = ref<{ name: string; color: string }[]>([]);
const groupList = ref<Group[]>([]);

// 用户搜索相关
const userList = ref<User[]>([]);
const userLoading = ref(false);

async function remoteSearchUsers(query: string) {
  if (query) {
    userLoading.value = true;
    try {
      const res = await searchUsers({ keyword: query, page: 1, pageSize: 20 });
      userList.value = res.items;
    } catch (e) {
      console.error(e);
    } finally {
      userLoading.value = false;
    }
  } else {
    userList.value = [];
  }
}

const form = reactive({
  title: '',
  description: '',
  assigneeId: undefined as number | undefined,
  groupId: undefined as number | undefined,
  priority: 'medium' as TaskPriority,
  dueDate: '',
  tags: [] as string[],
  estimatedHours: 0,
  isReminderOn: false,
  reminderTime: '',
});

const rules: FormRules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  reminderTime: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (form.isReminderOn && !value) {
          callback(new Error('请选择提醒时间'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
};

async function loadTags() {
  try {
    availableTags.value = await fetchTaskTags();
  } catch (error) {
    console.error('Failed to load tags');
  }
}

async function loadGroups() {
  try {
    const result = await getGroups({ page: 1, pageSize: 1000 });
    groupList.value = result.items;
  } catch (error) {
    console.error('Failed to load groups', error);
  }
}

async function submit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true;
      try {
        await createTask({
          title: form.title,
          description: form.description,
          assigneeId: form.assigneeId,
          groupId: form.groupId,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          tags: form.tags,
          estimatedHours: form.estimatedHours || undefined,
          isReminderOn: form.isReminderOn,
          reminderTime: form.reminderTime || undefined,
        });
        ElMessage.success('任务创建成功');
        router.push('/tasks');
      } catch (error: any) {
        ElMessage.error(error?.response?.data?.message || '创建失败');
      } finally {
        submitting.value = false;
      }
    }
  });
}

onMounted(() => {
  loadTags();
  loadGroups();
});
</script>

<style scoped>
.create-task-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  margin-bottom: 20px;
}
.form-card {
  padding: 20px;
}
.row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.half-width {
  flex: 1;
  min-width: 300px;
}
.unit {
  margin-left: 10px;
  color: #909399;
}
.actions {
  margin-top: 30px;
}
</style>
