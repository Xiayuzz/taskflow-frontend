<template>
  <div class="task-page">
    <div class="header">
      <h1>任务列表</h1>
      <div class="actions">
        <el-button
          type="primary"
          @click="openCreate"
          >新建任务</el-button
        >
        <el-button
          :loading="loading"
          @click="refresh"
          >刷新</el-button
        >
      </div>
    </div>

    <el-card
      shadow="never"
      class="filters-card"
    >
      <template #header>
        <div class="card-head">任务筛选</div>
      </template>
      <el-form
        :inline="true"
        :model="filters"
        class="filters"
        @submit.prevent
      >
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="标题/描述关键词"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            multiple
            clearable
            placeholder="全部"
            style="width: 200px"
          >
            <el-option
              label="待处理"
              value="pending"
            />
            <el-option
              label="进行中"
              value="in_progress"
            />
            <el-option
              label="已完成"
              value="done"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select
            v-model="filters.priority"
            multiple
            clearable
            placeholder="全部"
            style="width: 200px"
          >
            <el-option
              label="低"
              value="low"
            />
            <el-option
              label="中"
              value="medium"
            />
            <el-option
              label="高"
              value="high"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="filters.tags"
            multiple
            clearable
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
            style="width: 250px"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag.name"
              :label="tag.name"
              :value="tag.name"
            >
              <div class="tag-option">
                <span
                  class="tag-color-dot"
                  :style="{ backgroundColor: tag.color }"
                ></span>
                <span>{{ tag.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="指派给">
          <el-select
            v-model="filters.assigneeId"
            filterable
            remote
            clearable
            placeholder="搜索用户"
            :remote-method="remoteSearchUsers"
            :loading="userLoading"
            style="width: 200px"
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
        <el-form-item label="提醒">
          <el-select
            v-model="filters.hasReminder"
            clearable
            placeholder="全部"
            style="width: 120px"
          >
            <el-option
              label="是"
              :value="true"
            />
            <el-option
              label="否"
              :value="false"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="applyFilters"
            >筛选</el-button
          >
          <el-button @click="resetFilters">重置</el-button>
          <el-button
            type="info"
            @click="toggleAdvancedFilters"
          >
            {{ activeAdvancedFilters.length > 0 ? '▲ 高级筛选' : '▼ 高级筛选' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级筛选条件 -->
      <div
        class="advanced-filters"
        v-if="activeAdvancedFilters.length > 0"
      >
        <el-form
          :inline="true"
          :model="advancedFilters"
          label-width="100px"
        >
          <el-form-item label="创建日期">
            <el-date-picker
              v-model="advancedFilters.createdAtRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="更新日期">
            <el-date-picker
              v-model="advancedFilters.updatedAtRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker
              v-model="advancedFilters.dueDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="进度范围">
            <el-slider
              v-model="advancedFilters.progressRange"
              range
              :min="0"
              :max="100"
              style="width: 300px"
            />
            <span class="ml-2"
              >{{ advancedFilters.progressRange[0] }}% -
              {{ advancedFilters.progressRange[1] }}%</span
            >
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 批量操作工具栏 -->
    <div
      v-if="selectedTaskIds.length > 0 && userStore.isAdmin"
      class="batch-actions"
    >
      <el-button
        type="primary"
        @click="openBatchUpdateDialog"
        >批量更新</el-button
      >
      <el-button
        type="success"
        @click="openBatchAssignDialog"
        >批量分配</el-button
      >
      <el-button
        type="danger"
        @click="confirmBatchDelete"
        >批量删除</el-button
      >
      <span class="selected-count">已选择 {{ selectedTaskIds.length }} 项</span>
    </div>

    <el-table
      v-loading="loading"
      :data="pagedItems"
      border
      stripe
      class="task-table"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="userStore.isAdmin"
        type="selection"
        width="55"
      />
      <el-table-column
        prop="id"
        label="ID"
        width="70"
      />
      <el-table-column
        prop="title"
        label="标题"
        min-width="200"
      >
        <template #default="{ row }">
          <router-link
            :to="`/tasks/${row.id}`"
            class="title-link"
            >{{ row.title }}</router-link
          >
        </template>
      </el-table-column>
      <el-table-column
        label="创建者"
        width="120"
      >
        <template #default="{ row }">
          <span>{{ row.creator?.name || row.creator?.username || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="被指派人"
        width="120"
      >
        <template #default="{ row }">
          <span>{{ row.assignee?.name || row.assignee?.username || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="群组"
        width="120"
      >
        <template #default="{ row }">
          <span>{{ row.group?.name || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100"
      >
        <template #default="{ row }">
          <el-tag
            :type="statusTag(row.status)"
            size="small"
            >{{ statusText(row.status) }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="priority"
        label="优先级"
        width="90"
      >
        <template #default="{ row }">
          <el-tag
            :type="priorityTag(row.priority)"
            size="small"
            >{{ priorityText(row.priority) }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="progress"
        label="进度"
        width="150"
      >
        <template #default="{ row }">
          <el-progress
            :percentage="row.progress"
            :status="row.progress === 100 ? 'success' : undefined"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="dueDate"
        label="截止日期"
        width="160"
      >
        <template #default="{ row }">{{ formatDate(row.dueDate) }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="140"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="operation-buttons">
            <el-button
              size="small"
              text
              type="primary"
              @click="edit(row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              text
              type="danger"
              @click="remove(row)"
              >删除</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next, sizes"
        :page-sizes="[10, 20, 50]"
        :current-page="page"
        :page-size="pageSize"
        :total="filteredTotal"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>

    <el-dialog
      v-model="createVisible"
      title="新建任务"
      width="600px"
    >
      <el-form
        :model="createForm"
        label-width="100px"
      >
        <el-form-item label="标题">
          <el-input v-model="createForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="指派给">
          <el-select
            v-model="createForm.assigneeId"
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
        <el-form-item label="所属群组">
          <el-select
            v-model="createForm.groupId"
            clearable
            filterable
            placeholder="选择群组"
            style="width: 100%"
            :teleported="false"
          >
            <el-option
              v-for="group in groupList"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="createForm.priority">
            <el-option
              label="低"
              value="low"
            />
            <el-option
              label="中"
              value="medium"
            />
            <el-option
              label="高"
              value="high"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="截止">
          <el-date-picker
            v-model="createForm.dueDate"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="createForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
            style="width: 100%"
            :teleported="false"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag.name"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预估工时">
          <el-input
            v-model="createForm.estimatedHours"
            type="number"
            placeholder="小时"
            min="0"
          />
        </el-form-item>
        <el-form-item label="实际工时">
          <el-input
            v-model="createForm.actualHours"
            type="number"
            placeholder="小时"
            min="0"
          />
        </el-form-item>
        <el-form-item label="提醒设置">
          <el-switch v-model="createForm.isReminderOn" />
        </el-form-item>
        <el-form-item
          label="提醒时间"
          v-if="createForm.isReminderOn"
        >
          <el-date-picker
            v-model="createForm.reminderTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
            placeholder="选择提醒时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="creating"
          @click="submitCreate"
          >创建</el-button
        >
      </template>
    </el-dialog>

    <el-dialog
      v-model="editVisible"
      title="编辑任务"
      width="600px"
      destroy-on-close
    >
      <el-form
        v-if="editForm.id"
        :model="editForm"
        label-width="100px"
      >
        <el-form-item label="标题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="指派给">
          <el-select
            v-model="editForm.assigneeId"
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
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option
              label="待处理"
              value="pending"
            />
            <el-option
              label="进行中"
              value="in_progress"
            />
            <el-option
              label="已完成"
              value="done"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editForm.priority">
            <el-option
              label="低"
              value="low"
            />
            <el-option
              label="中"
              value="medium"
            />
            <el-option
              label="高"
              value="high"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="进度">
          <el-slider
            v-model="editForm.progress"
            :step="5"
            show-input
            style="max-width: 320px"
          />
        </el-form-item>
        <el-form-item label="截止">
          <el-date-picker
            v-model="editForm.dueDate"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="editForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag.name"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预估工时">
          <el-input
            v-model="editForm.estimatedHours"
            type="number"
            placeholder="小时"
            min="0"
          />
        </el-form-item>
        <el-form-item label="实际工时">
          <el-input
            v-model="editForm.actualHours"
            type="number"
            placeholder="小时"
            min="0"
          />
        </el-form-item>
        <el-form-item label="提醒设置">
          <el-switch v-model="editForm.isReminderOn" />
        </el-form-item>
        <el-form-item
          label="提醒时间"
          v-if="editForm.isReminderOn"
        >
          <el-date-picker
            v-model="editForm.reminderTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
            placeholder="选择提醒时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="updating"
          @click="submitEdit"
          >保存</el-button
        >
        >
      </template>
    </el-dialog>

    <!-- 批量更新对话框 -->
    <el-dialog
      v-model="batchUpdateVisible"
      title="批量更新任务"
      width="600px"
      destroy-on-close
    >
      <el-form
        :model="batchUpdateForm"
        label-width="100px"
      >
        <el-form-item label="状态">
          <el-select
            v-model="batchUpdateForm.status"
            placeholder="选择状态"
          >
            <el-option
              label="待处理"
              value="pending"
            />
            <el-option
              label="进行中"
              value="in_progress"
            />
            <el-option
              label="已完成"
              value="done"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select
            v-model="batchUpdateForm.priority"
            placeholder="选择优先级"
          >
            <el-option
              label="低"
              value="low"
            />
            <el-option
              label="中"
              value="medium"
            />
            <el-option
              label="高"
              value="high"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="进度">
          <el-slider
            v-model="batchUpdateForm.progress"
            :min="0"
            :max="100"
            :step="5"
            show-input
            style="max-width: 320px"
          />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="batchUpdateForm.dueDate"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
            placeholder="选择截止日期"
            clearable
          />
        </el-form-item>
        <el-form-item label="提醒设置">
          <el-select
            v-model="batchUpdateForm.isReminderOn"
            placeholder="选择提醒设置"
          >
            <el-option
              label="开启"
              :value="true"
            />
            <el-option
              label="关闭"
              :value="false"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchUpdateVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="batchLoading"
          @click="submitBatchUpdate"
          >批量更新</el-button
        >
      </template>
    </el-dialog>

    <!-- 批量分配对话框 -->
    <el-dialog
      v-model="batchAssignVisible"
      title="批量分配任务"
      width="500px"
      destroy-on-close
    >
      <el-form
        :model="batchAssignForm"
        label-width="100px"
      >
        <el-form-item label="分配对象">
          <el-select
            v-model="batchAssignForm.assigneeId"
            filterable
            remote
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
        <el-form-item label="发送通知">
          <el-switch v-model="batchAssignForm.notify" />
        </el-form-item>
        <el-form-item
          v-if="batchAssignForm.notify"
          label="通知消息"
        >
          <el-input
            v-model="batchAssignForm.message"
            type="textarea"
            placeholder="自定义通知消息"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchAssignVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="batchLoading"
          @click="submitBatchAssign"
          >批量分配</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { batchAssignTasks, batchDeleteTasks, batchUpdateTasks } from '@/services/batchService';
import { getGroups } from '@/services/groupService';
import {
  createTask,
  deleteTask,
  fetchTaskTags,
  searchTasks,
  updateTask,
} from '@/services/taskService';
import { searchUsers } from '@/services/userService';
import { useTaskStore } from '@/store/task';
import { useUserStore } from '@/store/user';
import type { Group, Task, TaskPriority, TaskStatus, UpdateTaskPayload, User } from '@/types/models';
import { toast } from '@/services/toast';

const taskStore = useTaskStore();
const userStore = useUserStore();
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);

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

// 可用标签
const availableTags = ref<{ name: string; color: string }[]>([]);
const groupList = ref<Group[]>([]);

// 基本过滤条件
const filters = reactive({
  keyword: '',
  status: [] as TaskStatus[],
  priority: [] as TaskPriority[],
  assigneeId: undefined as number | undefined,
  tags: [] as string[],
  hasReminder: undefined as boolean | undefined,
});

// 批量操作相关
const selectedTaskIds = ref<number[]>([]);
const batchUpdateVisible = ref(false);
const batchAssignVisible = ref(false);
const batchLoading = ref(false);

// 批量更新表单
const batchUpdateForm = reactive({
  status: '' as TaskStatus | '',
  priority: '' as TaskPriority | '',
  progress: undefined as number | undefined,
  dueDate: null as string | null,
  isReminderOn: undefined as boolean | undefined,
});

// 批量分配表单
const batchAssignForm = reactive({
  assigneeId: 0,
  notify: false,
  message: '',
});

// 处理选择变化
function handleSelectionChange(selection: Task[]) {
  selectedTaskIds.value = selection.map((task) => task.id);
}

// 打开批量更新对话框
function openBatchUpdateDialog() {
  // 重置表单
  Object.assign(batchUpdateForm, {
    status: '',
    priority: '',
    progress: undefined,
    dueDate: null,
    isReminderOn: undefined,
  });
  batchUpdateVisible.value = true;
}

// 打开批量分配对话框
function openBatchAssignDialog() {
  // 重置表单
  Object.assign(batchAssignForm, {
    assigneeId: 0,
    notify: false,
    message: '',
  });
  batchAssignVisible.value = true;
}

// 确认批量删除
function confirmBatchDelete() {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedTaskIds.value.length} 个任务吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await batchDeleteTasks(selectedTaskIds.value);
      toast.success('批量删除成功');
      refresh();
      selectedTaskIds.value = [];
    })
    .catch(() => {
      // 取消删除
    });
}

// 提交批量更新
async function submitBatchUpdate() {
  if (selectedTaskIds.value.length === 0) {
    toast.warning('请选择要更新的任务');
    return;
  }

  // 构建更新数据
  const updateData: Partial<UpdateTaskPayload> = {};
  if (batchUpdateForm.status) {
    updateData.status = batchUpdateForm.status;
  }
  if (batchUpdateForm.priority) {
    updateData.priority = batchUpdateForm.priority;
  }
  if (batchUpdateForm.progress !== undefined) {
    updateData.progress = batchUpdateForm.progress;
  }
  if (batchUpdateForm.dueDate !== null) {
    updateData.dueDate = batchUpdateForm.dueDate;
  }
  if (batchUpdateForm.isReminderOn !== undefined) {
    updateData.isReminderOn = batchUpdateForm.isReminderOn;
  }

  // 确保有要更新的字段
  if (Object.keys(updateData).length === 0) {
    toast.warning('请选择要更新的字段');
    return;
  }

  try {
    batchLoading.value = true;
    await batchUpdateTasks(selectedTaskIds.value, updateData);
    toast.success('批量更新成功');
    batchUpdateVisible.value = false;
    refresh();
    selectedTaskIds.value = [];
  } catch (error) {
    toast.error('批量更新失败');
  } finally {
    batchLoading.value = false;
  }
}

// 提交批量分配
async function submitBatchAssign() {
  if (selectedTaskIds.value.length === 0) {
    toast.warning('请选择要分配的任务');
    return;
  }

  if (!batchAssignForm.assigneeId) {
    toast.warning('请选择分配对象');
    return;
  }

  try {
    batchLoading.value = true;
    await batchAssignTasks(
      selectedTaskIds.value,
      batchAssignForm.assigneeId,
      batchAssignForm.notify,
      batchAssignForm.message
    );
    toast.success('批量分配成功');
    batchAssignVisible.value = false;
    refresh();
    selectedTaskIds.value = [];
  } catch (error) {
    toast.error('批量分配失败');
  } finally {
    batchLoading.value = false;
  }
}

// 高级过滤条件
const advancedFilters = reactive({
  createdAtRange: [] as [string, string] | [],
  updatedAtRange: [] as [string, string] | [],
  dueDateRange: [] as [string, string] | [],
  progressRange: [0, 100] as [number, number],
});

// 高级筛选面板状态
const activeAdvancedFilters = ref<string[]>([]);

// 切换高级筛选面板
function toggleAdvancedFilters() {
  if (activeAdvancedFilters.value.length > 0) {
    activeAdvancedFilters.value = [];
  } else {
    activeAdvancedFilters.value = ['1'];
  }
}

// 监听 filters 变化重置页码
watch(
  [filters, advancedFilters],
  () => {
    // 仅在 filters 变化时重置页码，刷新由“筛选”按钮触发以避免自动应用筛选
    page.value = 1;
  },
  { deep: true }
);

// 服务端分页：列表数据直接来自 store.list，total 来自 store.total
const filteredTotal = computed(() => taskStore.total); // 后端返回的 total
const pagedItems = computed(() => taskStore.list); // 当前页 items

// 应用筛选条件
function applyFilters() {
  // 主动触发刷新以应用当前筛选条件
  page.value = 1;
  refresh();
}

// 重置筛选条件
function resetFilters() {
  // 重置基本筛选
  filters.keyword = '';
  filters.status = [];
  filters.priority = [];
  filters.assigneeId = undefined;
  filters.tags = [];
  filters.hasReminder = undefined;

  // 重置高级筛选
  advancedFilters.createdAtRange = [];
  advancedFilters.updatedAtRange = [];
  advancedFilters.dueDateRange = [];
  advancedFilters.progressRange = [0, 100];

  page.value = 1;
  refresh();
}

function statusTag(s: TaskStatus) {
  return s === 'done' ? 'success' : s === 'in_progress' ? 'warning' : 'info';
}
function statusText(s: TaskStatus) {
  return s === 'pending' ? '待处理' : s === 'in_progress' ? '进行中' : '已完成';
}
function priorityTag(p: TaskPriority) {
  return p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'info';
}
function priorityText(p: TaskPriority) {
  return p === 'high' ? '高' : p === 'medium' ? '中' : '低';
}
function formatDate(d?: string) {
  return d ? d.replace('T', ' ').substring(0, 16) : '-';
}

// 获取标签列表
async function fetchTags() {
  try {
    const tags = await fetchTaskTags();
    availableTags.value = tags;
  } catch (e: any) {
    toast.error(e?.response?.data?.message || '获取标签失败');
  }
}

async function fetchGroups() {
  try {
    const result = await getGroups({ page: 1, pageSize: 1000 });
    groupList.value = result.items;
  } catch (e: any) {
    toast.error(e?.response?.data?.message || '获取群组失败');
  }
}

async function refresh() {
  loading.value = true;
  try {
    // 构建请求参数
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: filters.keyword,
      status: filters.status.length > 0 ? filters.status : undefined,
      priority: filters.priority.length > 0 ? filters.priority : undefined,
      assigneeId: filters.assigneeId,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      hasReminder: filters.hasReminder,
      // 高级筛选条件
      createdFrom:
        advancedFilters.createdAtRange.length >= 2 ? advancedFilters.createdAtRange[0] : undefined,
      createdTo:
        advancedFilters.createdAtRange.length >= 2 ? advancedFilters.createdAtRange[1] : undefined,
      updatedFrom:
        advancedFilters.updatedAtRange.length >= 2 ? advancedFilters.updatedAtRange[0] : undefined,
      updatedTo:
        advancedFilters.updatedAtRange.length >= 2 ? advancedFilters.updatedAtRange[1] : undefined,
      dueDateFrom:
        advancedFilters.dueDateRange.length >= 2 ? advancedFilters.dueDateRange[0] : undefined,
      dueDateTo:
        advancedFilters.dueDateRange.length >= 2 ? advancedFilters.dueDateRange[1] : undefined,
      minProgress: advancedFilters.progressRange[0],
      maxProgress: advancedFilters.progressRange[1],
      // 默认按更新时间倒序排序
      sort: 'updated_at',
      order: 'desc' as const,
    };

    // 使用 searchTasks 函数替代 fetchTasks 函数
    const result = await searchTasks({
      ...params,
      status: filters.status.length > 0 ? filters.status.join(',') : undefined,
      priority: filters.priority.length > 0 ? filters.priority.join(',') : undefined,
    });
    taskStore.setPage(result);

    // 更新可用过滤选项
    if (result.filters) {
      taskStore.availableFilters = result.filters.available;
      taskStore.appliedFilters = result.filters.applied;
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message || '获取任务失败');
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number) {
  page.value = p;
  refresh();
}
function onSizeChange(s: number) {
  pageSize.value = s;
  page.value = 1;
  refresh();
}

// 编辑
const editVisible = ref(false);
const updating = ref(false);
const editForm = reactive<{
  id?: number;
  title?: string;
  description?: string;
  assigneeId?: number | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
  dueDate?: string | null;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  isReminderOn?: boolean;
  reminderTime?: string | null;
}>({});
function edit(task: Task) {
  editForm.id = task.id;
  editForm.title = task.title;
  editForm.description = task.description;
  editForm.assigneeId = task.assigneeId || null;
  editForm.status = task.status;
  editForm.priority = task.priority;
  editForm.progress = task.progress;
  editForm.dueDate = task.dueDate || null;
  editForm.tags = task.tags || [];
  editForm.estimatedHours = task.estimatedHours;
  editForm.actualHours = task.actualHours;
  editForm.isReminderOn = task.isReminderOn || false;
  editForm.reminderTime = task.reminderTime || null;
  editVisible.value = true;
}
async function submitEdit() {
  if (!editForm.id) return;
  updating.value = true;
  try {
    await updateTask(editForm.id, {
      title: editForm.title,
      description: editForm.description,
      assigneeId: editForm.assigneeId,
      status: editForm.status,
      priority: editForm.priority,
      progress: editForm.progress,
      dueDate: editForm.dueDate || undefined,
      tags: editForm.tags,
      estimatedHours: editForm.estimatedHours ? Number(editForm.estimatedHours) : undefined,
      actualHours: editForm.actualHours ? Number(editForm.actualHours) : undefined,
      isReminderOn: editForm.isReminderOn,
      reminderTime: editForm.reminderTime || undefined,
    });
    toast.success('保存成功');
    editVisible.value = false;
    refresh();
  } catch (e: any) {
    toast.error(e?.response?.data?.message || '保存失败');
  } finally {
    updating.value = false;
  }
}
async function remove(task: Task) {
  try {
    await ElMessageBox.confirm(`确认删除任务 #${task.id}?`, '提示', { type: 'warning' });
    await deleteTask(task.id);
    toast.success('已删除');
    refresh();
  } catch {
    // cancel
  }
}

// 创建弹窗
const createVisible = ref(false);
const creating = ref(false);
const createForm = reactive<{
  title: string;
  description?: string;
  assigneeId?: number | null;
  groupId?: number | null;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  isReminderOn?: boolean;
  reminderTime?: string;
}>({
  title: '',
  description: '',
  priority: 'medium',
  tags: [],
  estimatedHours: 0,
  actualHours: 0,
  isReminderOn: false,
});
function openCreate() {
  createVisible.value = true;
}
async function submitCreate() {
  if (!createForm.title) {
    toast.warning('请输入标题');
    return;
  }
  creating.value = true;
  try {
    await createTask({
      title: createForm.title,
      description: createForm.description,
      assigneeId: createForm.assigneeId ?? undefined,
      groupId: createForm.groupId ?? undefined,
      priority: createForm.priority,
      dueDate: createForm.dueDate,
      tags: createForm.tags,
      estimatedHours: createForm.estimatedHours ? Number(createForm.estimatedHours) : undefined,
      isReminderOn: createForm.isReminderOn,
      reminderTime: createForm.reminderTime,
    });
    toast.success('创建成功');
    createVisible.value = false;
    // 重置表单
    createForm.title = '';
    createForm.description = '';
    createForm.assigneeId = null;
    createForm.groupId = null;
    createForm.priority = 'medium';
    createForm.dueDate = undefined;
    createForm.tags = [];
    createForm.estimatedHours = 0;
    createForm.actualHours = 0;
    createForm.isReminderOn = false;
    createForm.reminderTime = undefined;
    // 回到第一页查看最新任务
    page.value = 1;
    refresh();
  } catch (e: any) {
    toast.error(e?.response?.data?.message || '创建失败');
  } finally {
    creating.value = false;
  }
}

// 初始化
onMounted(() => {
  fetchTags();
  fetchGroups();
  refresh();
});
</script>

<style scoped>
.task-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
}
.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1565c0;
}
.filters-card {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  overflow: visible;
}
.filters-card :deep(.el-card__body) {
  overflow: visible;
}
.filters-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.card-head {
  font-size: 1rem;
  font-weight: 600;
  color: #1976d2;
}
.filters {
  background: #fff;
  padding: 1.25rem;
  border-radius: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.25rem;
  row-gap: 1rem;
  align-items: flex-start;
  overflow: visible;
}
.filters .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
  flex: 0 1 auto;
}
.filters :deep(.el-form-item__label) {
  flex: 0 0 auto;
}
.filters :deep(.el-form-item__content) {
  min-width: 0;
}
.filters :deep(.el-select),
.filters :deep(.el-input) {
  max-width: 100%;
}
.task-table {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-size: 14px;
}
.task-table :deep(.el-table__inner-wrapper) {
  border-radius: 0.5rem;
  overflow: hidden;
}
.task-table :deep(.el-table__header-wrapper) {
  background-color: #f5f8fd;
  border-bottom: 1px solid #e3f2fd;
}
.task-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f8fd;
  color: #1565c0;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 8px;
  border-bottom: 1px solid #e3f2fd;
}
.task-table :deep(.el-table__body-wrapper td) {
  padding: 14px 8px;
  font-size: 14px;
  line-height: 1.5;
}
.task-table :deep(.el-table__body-wrapper td:nth-last-child(1)) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.task-table :deep(.el-table__body-wrapper td .el-button) {
  margin: 0;
  padding: 4px 12px;
}
.task-table :deep(.el-table__body-wrapper td .el-button--text) {
  background-color: transparent;
  border: none;
  box-shadow: none;
  height: auto;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.task-table :deep(.el-table__body-wrapper td .el-button--text.el-button--primary) {
  color: #1976d2;
}
.task-table :deep(.el-table__body-wrapper td .el-button--text.el-button--danger) {
  color: #f44336;
}
.filters :deep(.el-button) {
  margin-right: 8px;
  margin-bottom: 8px;
}
.filters :deep(.el-button--info) {
  background-color: #e3f2fd;
  border-color: #bbdefb;
  color: #1976d2;
}
.filters :deep(.el-button--info:hover) {
  background-color: #bbdefb;
  border-color: #90caf9;
  color: #1565c0;
}
.task-table :deep(.el-table__body-wrapper tr:hover) {
  background-color: #f0f7ff;
}
.task-table :deep(.el-table__body-wrapper tr.el-table__row--striped) {
  background-color: #fafafa;
}
.task-table :deep(.el-table__body-wrapper tr.el-table__row--striped:hover) {
  background-color: #f0f7ff;
}
.title-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}
.title-link:hover {
  color: #1565c0;
  text-decoration: underline;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 0;
}
.pagination :deep(.el-pagination__total) {
  color: #616161;
}
.pagination :deep(.el-pagination__sizes) {
  margin-left: 1rem;
}
.pagination :deep(.el-pagination button:hover) {
  color: #1976d2;
}
.pagination :deep(.el-pagination .el-pager li:hover a) {
  color: #1976d2;
}
.pagination :deep(.el-pagination .el-pager li.active a) {
  color: #fff;
  background-color: #1976d2;
}
.advanced-filters {
  background: #fafafa;
  border-top: 1px solid #e3f2fd;
  border-radius: 0 0 0.5rem 0.5rem;
  margin: 0;
  padding: 1.25rem;
}
.advanced-filters :deep(.el-form) {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.25rem;
  row-gap: 1rem;
  align-items: flex-start;
}
.advanced-filters :deep(.el-collapse) {
  background: transparent;
  border: none;
}
.advanced-filters :deep(.el-collapse-item__header) {
  color: #1976d2;
  font-weight: 500;
  background: transparent;
  border: none;
  padding: 0.75rem 0;
}
.advanced-filters :deep(.el-collapse-item__content) {
  background: transparent;
  border: none;
  padding: 0.75rem 0;
}
.advanced-filters :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}
.advanced-filters :deep(.el-date-editor) {
  border-radius: 0.25rem;
}
.advanced-filters :deep(.el-slider__runway) {
  background-color: #e3f2fd;
}
.advanced-filters :deep(.el-slider__bar) {
  background-color: #1976d2;
}
.advanced-filters :deep(.el-slider__button) {
  border-color: #1976d2;
}
.advanced-filters :deep(.el-slider__button:hover) {
  border-color: #1565c0;
}
.advanced-filters :deep(.el-slider__button:focus) {
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
}
.pagination :deep(.el-pagination__jump-btn:hover) {
  color: #1976d2;
}

@media (max-width: 768px) {
  .task-page {
    padding: 0.75rem;
    gap: 1rem;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0;
  }
  .header h1 {
    font-size: 1.25rem;
  }
  .header .actions {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    gap: 0.5rem;
  }
  .filters {
    padding: 1rem;
    gap: 0.75rem;
  }
  .filters .el-form-item {
    margin-bottom: 0.5rem;
    width: 100%;
  }
  .filters .el-form-item .el-input,
  .filters .el-form-item .el-select,
  .filters .el-form-item .el-date-editor {
    width: 100% !important;
  }
  .task-table {
    font-size: 12px;
  }
  .task-table :deep(.el-table__header-wrapper th) {
    font-size: 12px;
    padding: 8px 4px;
  }
  .task-table :deep(.el-table__body-wrapper td) {
    padding: 10px 4px;
    font-size: 12px;
  }
  .task-table :deep(.el-table__body-wrapper td .el-button) {
    padding: 2px 8px;
    font-size: 12px;
  }
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .advanced-filters {
    margin: -1rem -1rem -1rem -1rem;
    padding: 0 1rem 1rem 1rem;
  }
}

@media (max-width: 480px) {
  .task-page {
    padding: 0.5rem;
    gap: 0.75rem;
  }
  .header h1 {
    font-size: 1.125rem;
  }
  .header .actions {
    flex-wrap: wrap;
  }
  .filters {
    padding: 0.75rem;
    gap: 0.5rem;
  }
  .task-table {
    font-size: 11px;
  }
  .task-table :deep(.el-table__header-wrapper th) {
    font-size: 11px;
    padding: 6px 2px;
  }
  .task-table :deep(.el-table__body-wrapper td) {
    padding: 8px 2px;
    font-size: 11px;
  }
  .task-table :deep(.el-table__body-wrapper td .el-button) {
    padding: 1px 6px;
    font-size: 11px;
  }
  .pagination {
    justify-content: center;
  }
  .pagination :deep(.el-pagination__total) {
    display: none;
  }
  .pagination :deep(.el-pagination__sizes) {
    display: none;
  }
}

/* 批量操作工具栏样式 */
.batch-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selected-count {
  margin-left: auto;
  color: #606266;
  font-size: 14px;
}

/* 标签选项样式 */
.tag-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

/* 多选标签样式 */
.el-select__tags {
  flex-wrap: wrap;
}

.el-select__tag {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
/* 操作列按钮样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.operation-buttons .el-button {
  padding: 4px 8px;
  height: 24px;
  font-size: 13px;
  border-radius: 4px;
}

.operation-buttons .el-button--primary {
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.operation-buttons .el-button--primary:hover {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.operation-buttons .el-button--danger {
  background-color: #fef0f0;
  border-color: #fde2e2;
}

.operation-buttons .el-button--danger:hover {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}
</style>
