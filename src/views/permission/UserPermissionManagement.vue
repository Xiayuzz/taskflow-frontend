<template>
  <div class="user-permissions">
    <div class="header">
      <h2>用户权限管理</h2>
      <el-button
        type="primary"
        @click="handleBack"
        :icon="ArrowLeft"
      >
        返回
      </el-button>
    </div>

    <!-- 用户信息 -->
    <el-card
      shadow="never"
      class="user-info-card mb-4"
    >
      <div class="user-info">
        <el-avatar
          :size="60"
          :src="userInfo.avatar || ''"
          :icon="UserIcon"
        />
        <div class="user-details">
          <h3>{{ userInfo.name || userInfo.username }}</h3>
          <p class="user-email">{{ userInfo.email }}</p>
          <p class="user-role">
            <el-tag
              :type="getRoleType(userInfo.role)"
              size="small"
            >
              {{ getRoleText(userInfo.role) }}
            </el-tag>
          </p>
        </div>
      </div>
    </el-card>

    <!-- 权限管理 -->
    <el-card
      shadow="never"
      class="permissions-card"
    >
      <template #header>
        <div class="card-header">
          <span>权限列表</span>
          <div class="header-actions">
            <el-button
              type="primary"
              size="small"
              @click="selectAllPermissions"
            >
              全选
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="deselectAllPermissions"
            >
              取消全选
            </el-button>
          </div>
        </div>
      </template>
      <el-form
        ref="permissionsFormRef"
        :model="permissionsForm"
        class="permissions-form"
      >
        <el-form-item label="权限">
          <el-checkbox-group
            v-model="permissionsForm.permissions"
            class="permissions-list"
          >
            <el-checkbox
              v-for="permission in allPermissions"
              :key="permission"
              :label="permission"
              :disabled="permission === 'admin'"
            >
              {{ formatPermissionLabel(permission) }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="text-right">
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            保存权限
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, User as UserIcon } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  getUserById,
  getUserPermissions,
  updateUserPermissions,
} from '@/services/permissionService';
import type { UpdateUserPermissionForm, User } from '@/types/models';

// 路由
const route = useRoute();
const router = useRouter();

// 获取用户ID
const userId = ref<number>(parseInt(route.params.id as string, 10));

// 加载状态
const loading = ref(false);
const submitting = ref(false);

// 用户信息
const userInfo = ref<User>({
  id: 0,
  username: '',
  name: '',
  email: '',
  role: 'user',
  status: 'active',
  createdAt: '',
  updatedAt: '',
});

// 权限列表
const allPermissions = ref<string[]>([
  'menu:view',
  'menu:create',
  'menu:update',
  'menu:delete',
  'user:view',
  'user:create',
  'user:update',
  'user:delete',
  'permission:view',
  'permission:update',
  'task:view',
  'task:create',
  'task:update',
  'task:delete',
  'task:assign',
  'task:comment',
  'stats:view',
]);

// 表单数据
const permissionsFormRef = ref<FormInstance | null>(null);
const permissionsForm = ref<UpdateUserPermissionForm>({
  permissions: [],
});

// 获取角色类型
function getRoleType(role: string) {
  switch (role) {
    case 'admin':
      return 'danger';
    case 'user':
      return 'success';
    case 'guest':
      return 'info';
    default:
      return 'warning';
  }
}

// 获取角色文本
function getRoleText(role: string) {
  switch (role) {
    case 'admin':
      return '管理员';
    case 'user':
      return '普通用户';
    case 'guest':
      return '访客';
    default:
      return role;
  }
}

// 格式化权限标签
function formatPermissionLabel(permission: string) {
  const permissionMap: Record<string, string> = {
    'menu:view': '查看菜单',
    'menu:create': '创建菜单',
    'menu:update': '更新菜单',
    'menu:delete': '删除菜单',
    'user:view': '查看用户',
    'user:create': '创建用户',
    'user:update': '更新用户',
    'user:delete': '删除用户',
    'permission:view': '查看权限',
    'permission:update': '更新权限',
    'task:view': '查看任务',
    'task:create': '创建任务',
    'task:update': '更新任务',
    'task:delete': '删除任务',
    'task:assign': '分配任务',
    'task:comment': '评论任务',
    'stats:view': '查看统计',
  };
  return permissionMap[permission] || permission;
}

// 选择所有权限
function selectAllPermissions() {
  permissionsForm.value.permissions = [...allPermissions.value];
}

// 取消全选
function deselectAllPermissions() {
  permissionsForm.value.permissions = [];
}

// 返回用户管理
function handleBack() {
  router.push('/permission/users');
}

// 加载用户信息
async function loadUserInfo() {
  loading.value = true;
  try {
    const user = await getUserById(userId.value);
    userInfo.value = user;
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载用户信息失败');
    router.push('/permission/users');
  } finally {
    loading.value = false;
  }
}

// 加载用户权限
async function loadUserPermissions() {
  loading.value = true;
  try {
    const result = await getUserPermissions(userId.value);
    permissionsForm.value.permissions = result.permissions || [];
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载用户权限失败');
  } finally {
    loading.value = false;
  }
}

// 保存用户权限
async function handleSubmit() {
  submitting.value = true;
  try {
    await updateUserPermissions(userId.value, permissionsForm.value);
    ElMessage.success('权限更新成功');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新权限失败');
  } finally {
    submitting.value = false;
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadUserInfo();
  await loadUserPermissions();
});

// 监听用户ID变化
watch(
  () => route.params.id,
  async (newId) => {
    userId.value = parseInt(newId as string, 10);
    await loadUserInfo();
    await loadUserPermissions();
  }
);
</script>

<style scoped>
.user-permissions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1565c0;
}

.user-info-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
}

.user-details {
  flex: 1;
}

.user-details h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.user-email {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.user-role {
  margin: 0;
}

.permissions-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.permissions-form {
  padding: 16px 0;
}

.permissions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.permissions-list .el-checkbox {
  margin: 0;
}

.mb-4 {
  margin-bottom: 16px;
}

.card-header span {
  font-weight: 600;
  font-size: 16px;
  color: #1565c0;
}

.text-right {
  text-align: right;
  margin-top: 20px;
}
</style>
