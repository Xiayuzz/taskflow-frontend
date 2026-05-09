<template>
  <el-dialog
    v-model="visible"
    title="选择用户"
    width="600px"
    @close="handleClose"
  >
    <div class="user-selector">
      <el-input
        v-model="searchKeyword"
        placeholder="输入用户名搜索"
        prefix-icon="Search"
        clearable
        @input="handleSearch"
        class="mb-4"
      />

      <el-table
        v-loading="loading"
        :data="users"
        height="400px"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="multiple"
          type="selection"
          width="55"
        />
        <el-table-column
          label="用户"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="flex items-center">
              <el-avatar
                :size="40"
                :src="row.avatar"
                class="mr-3"
              >
                {{ row.username?.charAt(0).toUpperCase() || 'U' }}
              </el-avatar>
              <div>
                <div class="font-medium">{{ row.username }}</div>
                <div class="text-sm text-gray-500">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="role"
          label="角色"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!multiple"
          label="操作"
          width="100"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleSelect(row)"
            >
              选择
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-center">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @current-change="loadUsers"
          @size-change="loadUsers"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        v-if="multiple"
        type="primary"
        @click="handleConfirm"
        :disabled="selectedUsers.length === 0"
      >
        确定 ({{ selectedUsers.length }})
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { searchUsers } from '@/services/userService';
import type { User } from '@/types/models';

interface Props {
  modelValue: boolean;
  multiple?: boolean;
  excludeIds?: number[];
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', user: User): void;
  (e: 'confirm', users: User[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  excludeIds: () => [],
});

const emit = defineEmits<Emits>();

const visible = ref(false);
const loading = ref(false);
const searchKeyword = ref('');
const users = ref<User[]>([]);
const selectedUsers = ref<User[]>([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      loadUsers();
    }
  }
);

watch(visible, (val) => {
  emit('update:modelValue', val);
});

function getRoleName(role: string) {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    user: '普通用户',
    guest: '访客',
  };
  return roleMap[role] || role;
}

function getRoleType(role: string) {
  const typeMap: Record<string, any> = {
    admin: 'danger',
    user: 'primary',
    guest: 'info',
  };
  return typeMap[role] || 'info';
}

async function loadUsers() {
  loading.value = true;
  try {
    const response = await searchUsers({
      keyword: searchKeyword.value,
      page: page.value,
      pageSize: pageSize.value,
      excludeIds: props.excludeIds,
    });
    users.value = response.items;
    total.value = response.total;
  } catch (error) {
    console.error('加载用户失败', error);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  loadUsers();
}

function handleSelectionChange(selection: User[]) {
  selectedUsers.value = selection;
}

function handleSelect(user: User) {
  emit('select', user);
  handleClose();
}

function handleConfirm() {
  emit('confirm', selectedUsers.value);
  handleClose();
}

function handleClose() {
  visible.value = false;
  searchKeyword.value = '';
  selectedUsers.value = [];
  page.value = 1;
}
</script>

<style scoped>
.user-selector {
  padding: 10px 0;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.mr-3 {
  margin-right: 12px;
}

.mt-4 {
  margin-top: 16px;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 14px;
}

.text-gray-500 {
  color: #6b7280;
}
</style>
