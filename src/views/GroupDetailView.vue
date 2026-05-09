<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ group?.name }}</h1>
      <div>
        <el-button
          type="warning"
          :to="`/groups/${groupId}/edit`"
          class="mr-2"
        >
          编辑
        </el-button>
        <router-link
          to="/groups"
          class="inline-flex items-center justify-center h-10 px-5 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md bg-gray-600 hover:bg-gray-700 focus:shadow-outline focus:outline-none"
        >
          返回列表
        </router-link>
      </div>
    </div>

    <el-card
      v-loading="loading"
      class="mb-6"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span>群组信息</span>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p class="text-gray-600">
            <span class="font-semibold mr-2">群组名称：</span>
            {{ group?.name }}
          </p>
          <p class="text-gray-600 mt-2">
            <span class="font-semibold mr-2">描述：</span>
            {{ group?.description }}
          </p>
          <p class="text-gray-600 mt-2">
            <span class="font-semibold mr-2">成员数：</span>
            {{ group?.memberCount }}
          </p>
        </div>
        <div>
          <p class="text-gray-600">
            <span class="font-semibold mr-2">创建时间：</span>
            {{ formatTime(group?.createdAt) }}
          </p>
          <p class="text-gray-600 mt-2">
            <span class="font-semibold mr-2">更新时间：</span>
            {{ formatTime(group?.updatedAt) }}
          </p>
        </div>
      </div>
    </el-card>

    <el-card
      v-loading="membersLoading"
      class="mb-6"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span>群组成员</span>
          <el-button
            type="primary"
            @click="showAddMemberDialog = true"
          >
            添加成员
          </el-button>
        </div>
      </template>
      <el-table
        :data="members"
        style="width: 100%"
        border
      >
        <el-table-column
          prop="userId"
          label="用户ID"
          width="100"
        />
        <el-table-column
          prop="userName"
          label="用户名"
          min-width="150"
        />
        <el-table-column
          prop="role"
          label="角色"
          width="120"
        >
          <template #default="scope">
            <el-tag
              :type="
                scope.row.role === 'owner'
                  ? 'danger'
                  : scope.row.role === 'admin'
                    ? 'warning'
                    : 'info'
              "
            >
              {{
                scope.row.role === 'owner'
                  ? '所有者'
                  : scope.row.role === 'admin'
                    ? '管理员'
                    : '成员'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="joinedAt"
          label="加入时间"
          width="180"
        >
          <template #default="scope">
            {{ formatTime(scope.row.joinedAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="removeMember(scope.row.userId)"
              :disabled="scope.row.role === 'owner'"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-loading="tasksLoading">
      <template #header>
        <div class="flex justify-between items-center">
          <span>群组任务</span>
        </div>
      </template>
      <el-table
        :data="tasks"
        style="width: 100%"
        border
      >
        <el-table-column
          prop="id"
          label="任务ID"
          width="80"
        />
        <el-table-column
          prop="title"
          label="任务标题"
          min-width="200"
        >
          <template #default="scope">
            <router-link
              :to="`/tasks/${scope.row.id}`"
              class="text-blue-accent-400 hover:underline"
            >
              {{ scope.row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="120"
        >
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'completed'
                  ? 'success'
                  : scope.row.status === 'in_progress'
                    ? 'warning'
                    : 'info'
              "
            >
              {{
                scope.row.status === 'completed'
                  ? '已完成'
                  : scope.row.status === 'in_progress'
                    ? '进行中'
                    : '待处理'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          label="优先级"
          width="120"
        >
          <template #default="scope">
            <el-tag
              :type="
                scope.row.priority === 'high'
                  ? 'danger'
                  : scope.row.priority === 'medium'
                    ? 'warning'
                    : 'info'
              "
            >
              {{
                scope.row.priority === 'high' ? '高' : scope.row.priority === 'medium' ? '中' : '低'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="assigneeName"
          label="负责人"
          width="150"
        />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
        >
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex justify-center">
        <el-pagination
          v-model:current-page="taskPage"
          v-model:page-size="taskPageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="taskTotal"
          @size-change="handleTaskSizeChange"
          @current-change="handleTaskCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加成员对话框 -->
    <el-dialog
      v-model="showAddMemberDialog"
      title="添加成员"
      width="500px"
    >
      <el-form
        :model="addMemberForm"
        :rules="addMemberRules"
        ref="addMemberFormRef"
        label-width="100px"
      >
        <el-form-item
          label="用户"
          prop="userId"
        >
          <el-button
            type="primary"
            @click="showUserSelector = true"
          >
            {{ selectedUserName || '选择用户' }}
          </el-button>
        </el-form-item>
        <el-form-item
          label="角色"
          prop="role"
        >
          <el-select
            v-model="addMemberForm.role"
            placeholder="请选择角色"
          >
            <el-option
              label="成员"
              value="member"
            />
            <el-option
              label="管理员"
              value="admin"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddMemberDialog = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="addMember"
          :loading="addingMember"
        >
          添加
        </el-button>
      </template>
    </el-dialog>

    <UserSelector
      v-model="showUserSelector"
      :exclude-ids="memberUserIds"
      @select="handleUserSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import UserSelector from '@/components/UserSelector.vue';
import {
  addGroupMember,
  getGroupById,
  getGroupMembers,
  getGroupTasks,
  removeGroupMember,
} from '@/services/groupService';
import type { AddGroupMemberForm, Group, GroupMember, User } from '@/types/models';

const route = useRoute();
const groupId = computed(() => Number(route.params.id));

const loading = ref(true);
const membersLoading = ref(true);
const tasksLoading = ref(true);
const group = ref<Group | null>(null);
const members = ref<GroupMember[]>([]);
const tasks = ref<any[]>([]);
const taskTotal = ref(0);
const taskPage = ref(1);
const taskPageSize = ref(10);

const showAddMemberDialog = ref(false);
const showUserSelector = ref(false);
const addMemberFormRef = ref<FormInstance>();
const addingMember = ref(false);
const addMemberForm = ref<AddGroupMemberForm>({
  userId: 0,
  role: 'member',
});
const selectedUserName = ref('');

const memberUserIds = computed(() => members.value.map((m) => m.userId));

function handleUserSelect(user: User) {
  addMemberForm.value.userId = user.id;
  selectedUserName.value = user.username;
}

const addMemberRules: FormRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

function formatTime(time?: string) {
  if (!time) return '';
  return time.replace('T', ' ').substring(0, 19);
}

async function loadGroup() {
  loading.value = true;
  try {
    group.value = await getGroupById(groupId.value);
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '加载群组信息失败');
  } finally {
    loading.value = false;
  }
}

async function loadMembers() {
  membersLoading.value = true;
  try {
    members.value = await getGroupMembers(groupId.value);
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '加载群组成员失败');
  } finally {
    membersLoading.value = false;
  }
}

async function loadTasks() {
  tasksLoading.value = true;
  try {
    const result = await getGroupTasks(groupId.value, {
      page: taskPage.value,
      pageSize: taskPageSize.value,
    });
    tasks.value = result.items;
    taskTotal.value = result.total;
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '加载群组任务失败');
  } finally {
    tasksLoading.value = false;
  }
}

async function addMember() {
  if (!addMemberFormRef.value) return;
  try {
    await addMemberFormRef.value.validate();
    addingMember.value = true;
    await addGroupMember(groupId.value, addMemberForm.value);
    ElMessage.success('成员添加成功');
    showAddMemberDialog.value = false;
    addMemberForm.value = {
      userId: 0,
      role: 'member',
    };
    loadMembers();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '添加成员失败');
    }
  } finally {
    addingMember.value = false;
  }
}

async function removeMember(userId: number) {
  try {
    await ElMessageBox.confirm('确定要移除此成员吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await removeGroupMember(groupId.value, userId);
    ElMessage.success('成员移除成功');
    loadMembers();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '移除成员失败');
    }
  }
}

function handleTaskSizeChange(val: number) {
  taskPageSize.value = val;
  loadTasks();
}

function handleTaskCurrentChange(val: number) {
  taskPage.value = val;
  loadTasks();
}

onMounted(() => {
  loadGroup();
  loadMembers();
  loadTasks();
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

.el-card {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 10px;
}

.el-pagination {
  margin-top: 20px;
}
</style>
