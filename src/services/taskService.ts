import api from '@/services/api';
import type {
  AdvancedSearchResult,
  AssignTaskPayload,
  BatchOperationResult,
  CreateReminderPayload,
  CreateTaskPayload,
  PaginatedResult,
  Task,
  TaskPriority,
  TaskReminder,
  TaskStatus,
  TaskTag,
  UpdateTaskPayload,
  UserLoadStats,
} from '@/types/models';

function normalizeOptionalRelationId(value?: number | string | null): string | null | undefined {
  if (value === undefined || value === null || value === '') {
    return value;
  }

  return String(value);
}

// 任务列表参数
export interface TaskListParams {
  page: number;
  pageSize: number;
  status?: TaskStatus | TaskStatus[] | string;
  priority?: TaskPriority | TaskPriority[] | string;
  assigneeId?: number;
  creatorId?: number;
  keyword?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  tags?: string[];
  minProgress?: number;
  maxProgress?: number;
  hasReminder?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  groupId?: number | string; // 支持多选，用逗号分隔的字符串或数组，但在API调用时通常转为string或重复参数
}

// 批量操作请求体创建任务请求体
// 已在 models.ts 中定义

// 更新任务请求体
// 已在 models.ts 中定义

// 任务分配请求体
// 已在 models.ts 中定义

// 批量操作请求体
export interface BatchTaskPayload {
  ids: number[];
  action: 'update' | 'delete' | 'assign' | 'tag';
  data?: any;
}

// 扩展现有方法
export async function fetchTasks(params: TaskListParams): Promise<PaginatedResult<Task>> {
  const { data } = await api.get('/tasks', { params });
  return data;
}

export async function getTask(id: number): Promise<Task> {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await api.post('/tasks', {
    ...payload,
    assigneeId: normalizeOptionalRelationId(payload.assigneeId),
    groupId: normalizeOptionalRelationId(payload.groupId),
  });
  return data;
}

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await api.patch(`/tasks/${id}`, {
    ...payload,
    assigneeId: normalizeOptionalRelationId(payload.assigneeId),
  });
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

// 新增：高级任务搜索
export async function searchTasks(params: TaskListParams): Promise<AdvancedSearchResult<Task>> {
  const { data } = await api.get('/tasks/search', { params });
  return data;
}

// 新增：批量操作
export async function batchUpdateTasks(payload: BatchTaskPayload): Promise<BatchOperationResult> {
  const { data } = await api.post('/api/tasks/batch', payload);
  return data;
}

// 批量删除任务
export async function batchDeleteTasks(ids: number[]): Promise<BatchOperationResult> {
  return batchUpdateTasks({
    ids,
    action: 'delete',
  });
}

// 批量分配任务
export async function batchAssignTasks(
  ids: number[],
  assigneeId: number,
  notify?: boolean,
  message?: string
): Promise<BatchOperationResult> {
  return batchUpdateTasks({
    ids,
    action: 'assign',
    data: {
      assigneeId,
      notify,
      message,
    },
  });
}

// 批量添加标签到任务
export async function batchAddTagsToTasks(
  taskIds: number[],
  tagId: number
): Promise<BatchOperationResult> {
  return batchUpdateTasks({
    ids: taskIds,
    action: 'tag',
    data: {
      tagId,
      operation: 'add',
    },
  });
}

// 新增：分配任务
export async function assignTask(id: number, payload: AssignTaskPayload): Promise<Task> {
  const { data } = await api.post(`/tasks/${id}/assign`, {
    ...payload,
    assigneeId: String(payload.assigneeId),
  });
  return data;
}

// 新增：获取用户任务负载
export async function getUserTaskLoad(
  userId: number,
  period?: string,
  type?: string
): Promise<UserLoadStats> {
  const { data } = await api.get(`/users/${userId}/load`, { params: { period, type } });
  return data;
}

// 新增：任务标签管理
import * as attachmentService from './attachmentService';
import * as tagService from './tagService';

export async function fetchTaskTags(): Promise<TaskTag[]> {
  const result = await tagService.getTags({ pageSize: 100 });
  return result.items;
}

export async function createTaskTag(name: string, color: string): Promise<TaskTag> {
  return tagService.createTag({ name, color });
}

// 任务附件相关
export async function getTaskAttachments(taskId: number) {
  return attachmentService.getTaskAttachments(taskId);
}

export async function uploadTaskAttachment(taskId: number, file: File, description?: string) {
  return attachmentService.uploadAttachment(taskId, file, description);
}

export async function deleteTaskAttachment(attachmentId: number) {
  return attachmentService.deleteAttachment(attachmentId);
}

// 新增：任务提醒管理
export async function fetchTaskReminders(taskId: number): Promise<TaskReminder[]> {
  const { data } = await api.get(`/tasks/${taskId}/reminders`);
  return data.items;
}

export async function createTaskReminder(
  taskId: number,
  payload: CreateReminderPayload
): Promise<TaskReminder> {
  const { data } = await api.post(`/tasks/${taskId}/reminders`, payload);
  return data;
}

export async function deleteTaskReminder(reminderId: number): Promise<void> {
  await api.delete(`/task-reminders/${reminderId}`);
}

// 新增：提交任务进度
export interface TaskProgressPayload {
  progress: number;
  actualHours: number;
  remark?: string;
}

export async function submitTaskProgress(
  taskId: number,
  payload: TaskProgressPayload
): Promise<Task> {
  const { data } = await api.post(`/api/v1/tasks/${taskId}/progress`, payload);
  return data;
}
