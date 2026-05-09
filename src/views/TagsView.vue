<template>
  <div class="tags-page">
    <div class="header">
      <h1>标签管理</h1>
      <el-button
        type="primary"
        @click="openCreate"
        >新建标签</el-button
      >
    </div>

    <!-- 标签统计概览 -->
    <div
      class="stats-row"
      v-if="stats.length > 0"
    >
      <el-card
        shadow="hover"
        class="stat-card"
      >
        <template #header>标签总数</template>
        <div class="stat-value">{{ stats.length }}</div>
      </el-card>
      <el-card
        shadow="hover"
        class="stat-card"
      >
        <template #header>最常用标签</template>
        <div class="stat-value text-ellipsis">
          <el-tag
            v-if="mostUsedTag"
            :color="mostUsedTag.color"
            effect="dark"
            style="border: none"
            >{{ mostUsedTag.name }}</el-tag
          >
          <span v-else>-</span>
        </div>
      </el-card>
    </div>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="tags"
        style="width: 100%"
      >
        <el-table-column
          label="名称"
          width="200"
        >
          <template #default="{ row }">
            <el-tag
              :color="row.color"
              effect="dark"
              style="border: none"
              >{{ row.name }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="颜色值"
          width="120"
          prop="color"
        />
        <el-table-column
          label="使用次数"
          width="120"
        >
          <template #default="{ row }">
            {{ getUsageCount(row.id) }}
          </template>
        </el-table-column>
        <el-table-column
          label="最后使用时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(getLastUsed(row.id)) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="openEdit(row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="warning"
              @click="openMerge(row)"
              >合并到...</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '新建标签'"
      width="400px"
    >
      <el-form
        :model="form"
        label-width="80px"
      >
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="form.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          >确定</el-button
        >
      </template>
    </el-dialog>

    <!-- 合并标签对话框 -->
    <el-dialog
      v-model="mergeVisible"
      title="合并标签"
      width="400px"
    >
      <p>
        将标签 <strong>{{ sourceTag?.name }}</strong> 合并到：
      </p>
      <el-select
        v-model="targetTagId"
        placeholder="选择目标标签"
        style="width: 100%; margin-top: 10px"
      >
        <el-option
          v-for="tag in tags.filter((t) => t.id !== sourceTag?.id)"
          :key="tag.id"
          :label="tag.name"
          :value="tag.id"
        />
      </el-select>
      <p class="text-warning mt-2">注意：合并后源标签将被删除，所有关联任务将指向目标标签。</p>
      <template #footer>
        <el-button @click="mergeVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitMerge"
          :disabled="!targetTagId"
          >合并</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import {
  createTag,
  deleteTag,
  getTags,
  getTagStats,
  mergeTags,
  updateTag,
} from '@/services/tagService';
import type { TagStats } from '@/types/advanced';
import type { TaskTag } from '@/types/models';

const loading = ref(false);
const tags = ref<TaskTag[]>([]);
const stats = ref<TagStats[]>([]);

const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({
  id: 0,
  name: '',
  color: '#409eff',
});

const mergeVisible = ref(false);
const sourceTag = ref<TaskTag | null>(null);
const targetTagId = ref<number | null>(null);

const mostUsedTag = computed(() => {
  if (stats.value.length === 0) return null;
  return stats.value.reduce((prev, current) =>
    prev.usageCount > current.usageCount ? prev : current
  );
});

function getUsageCount(id: number) {
  return stats.value.find((s) => s.id === id)?.usageCount || 0;
}

function getLastUsed(id: number) {
  return stats.value.find((s) => s.id === id)?.lastUsedAt;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}

async function loadData() {
  loading.value = true;
  try {
    const [tagsRes, statsRes] = await Promise.all([getTags({ pageSize: 1000 }), getTagStats()]);
    tags.value = tagsRes.items;
    stats.value = statsRes;
  } catch (error) {
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  isEdit.value = false;
  form.name = '';
  form.color = '#409eff';
  dialogVisible.value = true;
}

function openEdit(row: TaskTag) {
  isEdit.value = true;
  form.id = row.id;
  form.name = row.name;
  form.color = row.color;
  dialogVisible.value = true;
}

async function submitForm() {
  if (!form.name) return ElMessage.warning('请输入名称');
  try {
    if (isEdit.value) {
      await updateTag(form.id, { name: form.name, color: form.color });
    } else {
      await createTag({ name: form.name, color: form.color });
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    ElMessage.error('操作失败');
  }
}

function handleDelete(row: TaskTag) {
  ElMessageBox.confirm(`确定删除标签 "${row.name}" 吗？`, '提示', { type: 'warning' }).then(
    async () => {
      try {
        await deleteTag(row.id);
        ElMessage.success('删除成功');
        loadData();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    }
  );
}

function openMerge(row: TaskTag) {
  sourceTag.value = row;
  targetTagId.value = null;
  mergeVisible.value = true;
}

async function submitMerge() {
  if (!sourceTag.value || !targetTagId.value) return;
  try {
    await mergeTags(sourceTag.value.id, targetTagId.value);
    ElMessage.success('合并成功');
    mergeVisible.value = false;
    loadData();
  } catch (error) {
    ElMessage.error('合并失败');
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.tags-page {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}
.text-warning {
  color: #e6a23c;
  font-size: 12px;
}
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
