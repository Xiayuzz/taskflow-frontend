<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">群组管理</h1>
      <router-link
        to="/groups/create"
        class="inline-flex items-center justify-center h-10 px-5 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md bg-blue-accent-400 hover:bg-blue-accent-700 focus:shadow-outline focus:outline-none"
      >
        创建群组
      </router-link>
    </div>

    <div class="mb-6">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索群组名称"
        prefix-icon="el-icon-search"
        class="max-w-md"
        @keyup.enter="loadGroups"
      />
    </div>

    <el-table
      v-loading="loading"
      :data="groups"
      style="width: 100%"
      border
    >
      <el-table-column
        prop="id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="name"
        label="群组名称"
        min-width="180"
      >
        <template #default="scope">
          <router-link
            :to="`/groups/${scope.row.id}`"
            class="text-blue-accent-400 hover:underline"
          >
            {{ scope.row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="描述"
        min-width="200"
      />
      <el-table-column
        prop="memberCount"
        label="成员数"
        width="100"
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
      <el-table-column
        label="操作"
        width="180"
        fixed="right"
      >
        <template #default="scope">
          <div class="flex space-x-2">
            <el-button
              type="primary"
              size="small"
              @click="router.push(`/groups/${scope.row.id}`)"
              class="w-20"
            >
              查看
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="router.push(`/groups/${scope.row.id}/edit`)"
              class="w-20"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteGroup(scope.row.id)"
              class="w-20"
            >
              删除
            </el-button>
          </div>
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
import { ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { deleteGroup as deleteGroupApi, getGroups } from '@/services/groupService';
import type { Group } from '@/types/models';
import { toast } from '@/services/toast';

const router = useRouter();
const loading = ref(false);
const groups = ref<Group[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');

function formatTime(time: string) {
  return time.replace('T', ' ').substring(0, 19);
}

async function loadGroups() {
  loading.value = true;
  try {
    const result = await getGroups({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
    });
    groups.value = result.items;
    total.value = result.total;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || '加载群组失败');
  } finally {
    loading.value = false;
  }
}

async function deleteGroup(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除此群组吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await deleteGroupApi(id);
    toast.success('群组删除成功');
    loadGroups();
  } catch (error: any) {
    if (error !== 'cancel') {
      toast.error(error?.response?.data?.message || '删除群组失败');
    }
  }
}

function handleSizeChange(val: number) {
  pageSize.value = val;
  loadGroups();
}

function handleCurrentChange(val: number) {
  page.value = val;
  loadGroups();
}

onMounted(() => {
  loadGroups();
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

.flex {
  display: flex;
}

.space-x-2 > * + * {
  margin-left: 8px;
}
</style>
