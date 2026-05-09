<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
      <el-button
        type="primary"
        @click="handleAddUser"
        :icon="Plus"
      >
        新增用户
      </el-button>
    </div>

    <!-- 筛选表单 -->
    <el-card
      shadow="never"
      class="filters-card mb-4"
    >
      <el-form
        :inline="true"
        :model="filters"
        class="filters"
      >
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="用户名/姓名/邮箱"
            clearable
            style="width: 200px"
            @input="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="filters.role"
            placeholder="全部"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option
              label="管理员"
              value="admin"
            />
            <el-option
              label="普通用户"
              value="user"
            />
            <el-option
              label="访客"
              value="guest"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            placeholder="全部"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option
              label="激活"
              value="active"
            />
            <el-option
              label="禁用"
              value="inactive"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card
      shadow="never"
      class="users-card"
    >
      <el-table
        v-loading="loading"
        :data="users"
        stripe
        border
        class="users-table"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          align="center"
        />
        <el-table-column
          prop="username"
          label="用户名"
        />
        <el-table-column
          prop="name"
          label="姓名"
        />
        <el-table-column
          prop="email"
          label="邮箱"
        />
        <el-table-column
          prop="role"
          label="角色"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="getRoleType(row.role)"
              size="small"
            >
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="updatedAt"
          label="更新时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              @click="handleEditUser(row)"
            >
              编辑
            </el-button>
            <el-button
              type="info"
              size="small"
              text
              @click="handleEditPermissions(row)"
            >
              权限
            </el-button>
            <el-button
              type="danger"
              size="small"
              text
              @click="handleDeleteUser(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination mt-4">
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
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item
          label="姓名"
          prop="name"
        >
          <el-input
            v-model="userForm.name"
            placeholder="请输入姓名"
          />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input
            v-model="userForm.email"
            placeholder="请输入邮箱"
            type="email"
          />
        </el-form-item>
        <el-form-item
          v-if="!editingUserId"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="userForm.password"
            placeholder="请输入密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item
          label="角色"
          prop="role"
        >
          <el-select
            v-model="userForm.role"
            placeholder="请选择角色"
          >
            <el-option
              label="管理员"
              value="admin"
            />
            <el-option
              label="普通用户"
              value="user"
            />
            <el-option
              label="访客"
              value="guest"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">激活</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox, FormRules } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { createUser, deleteUser, getUsers, updateUser } from '@/services/permissionService';
import type { CreateUserForm, UpdateUserForm, User } from '@/types/models';

// 路由
const router = useRouter();

// 用户数据
const users = ref<User[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const submitting = ref(false);

// 筛选条件
const filters = ref({
  keyword: '',
  role: '',
  status: '',
});

// 表单数据
const userFormRef = ref<FormInstance | null>(null);
const dialogVisible = ref(false);
const dialogTitle = ref('新增用户');
const editingUserId = ref<number | null>(null);

const userForm = ref<CreateUserForm | UpdateUserForm>({
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
});

const userRules = ref<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [{ required: !editingUserId.value, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
});

// 格式化日期
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

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

// 加载用户数据
async function loadUsers() {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: filters.value.keyword,
      role: filters.value.role,
      status: filters.value.status,
    };
    const result = await getUsers(params);
    users.value = result.items;
    total.value = result.total;
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载用户失败');
  } finally {
    loading.value = false;
  }
}

// 搜索用户
function handleSearch() {
  page.value = 1;
  loadUsers();
}

// 页面大小变化
function handleSizeChange(newSize: number) {
  pageSize.value = newSize;
  page.value = 1;
  loadUsers();
}

// 当前页面变化
function handleCurrentChange(newPage: number) {
  page.value = newPage;
  loadUsers();
}

// 新增用户
function handleAddUser() {
  dialogTitle.value = '新增用户';
  editingUserId.value = null;
  userForm.value = {
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
  };
  userFormRef.value?.resetFields();
  dialogVisible.value = true;
}

// 编辑用户
function handleEditUser(user: User) {
  dialogTitle.value = '编辑用户';
  editingUserId.value = user.id;
  userForm.value = {
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
  dialogVisible.value = true;
}

// 编辑用户权限
function handleEditPermissions(user: User) {
  router.push(`/permission/user-permissions/${user.id}`);
}

// 删除用户
async function handleDeleteUser(user: User) {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.name}" 吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
    await deleteUser(user.id);
    ElMessage.success('删除成功');
    loadUsers();
  } catch (error) {
    // 取消删除
  }
}

// 提交表单
async function handleSubmit() {
  if (!userFormRef.value) return;

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (editingUserId.value) {
          await updateUser(editingUserId.value, userForm.value as UpdateUserForm);
          ElMessage.success('更新成功');
        } else {
          await createUser(userForm.value as CreateUserForm);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        loadUsers();
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '操作失败');
      } finally {
        submitting.value = false;
      }
    }
  });
}

// 改变用户状态
async function handleStatusChange(user: User) {
  try {
    await updateUser(user.id, { status: user.status });
    ElMessage.success('状态更新成功');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '状态更新失败');
    // 恢复原状态
    loadUsers();
  }
}

// 初始加载数据
loadUsers();
</script>

<style scoped>
.user-management {
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

.filters-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.users-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.users-table {
  width: 100%;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0 0;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
