import api from '@/services/api';
import type { BatchOperationResult, Task, UpdateTaskPayload } from '@/types/models';

/**
 * 批量操作类型
 */
export type BatchActionType = 'update' | 'delete' | 'assign' | 'tag';

/**
 * 批量操作请求体
 */
export interface BatchOperationRequest {
  ids: number[];
  action: BatchActionType;
  data?: any;
}

/**
 * 批量更新任务
 */
export async function batchUpdateTasks(
  ids: number[],
  updateData: Partial<UpdateTaskPayload>
): Promise<BatchOperationResult> {
  const response = await api.post('/api/tasks/batch', {
    ids,
    action: 'update',
    data: updateData,
  });
  return response.data;
}

/**
 * 批量删除任务
 */
export async function batchDeleteTasks(ids: number[]): Promise<BatchOperationResult> {
  const response = await api.post('/api/tasks/batch', {
    ids,
    action: 'delete',
  });
  return response.data;
}

/**
 * 批量分配任务
 */
export async function batchAssignTasks(
  ids: number[],
  assigneeId: number,
  notify?: boolean,
  message?: string
): Promise<BatchOperationResult> {
  const response = await api.post('/api/tasks/batch', {
    ids,
    action: 'assign',
    data: {
      assigneeId,
      notify,
      message,
    },
  });
  return response.data;
}

/**
 * 批量添加标签到任务
 */
export async function batchAddTagsToTasks(
  taskIds: number[],
  tagId: number
): Promise<BatchOperationResult> {
  const response = await api.post('/api/tasks/batch', {
    ids: taskIds,
    action: 'tag',
    data: {
      tagId,
      operation: 'add',
    },
  });
  return response.data;
}

/**
 * 批量从任务中移除标签
 */
export async function batchRemoveTagsFromTasks(
  taskIds: number[],
  tagId: number
): Promise<BatchOperationResult> {
  const response = await api.post('/api/tasks/batch', {
    ids: taskIds,
    action: 'tag',
    data: {
      tagId,
      operation: 'remove',
    },
  });
  return response.data;
}

/**
 * 批量更新任务状态
 */
export async function batchUpdateTaskStatus(
  ids: number[],
  status: Task['status']
): Promise<BatchOperationResult> {
  return batchUpdateTasks(ids, { status });
}

/**
 * 批量更新任务优先级
 */
export async function batchUpdateTaskPriority(
  ids: number[],
  priority: Task['priority']
): Promise<BatchOperationResult> {
  return batchUpdateTasks(ids, { priority });
}

/**
 * 批量更新任务进度
 */
export async function batchUpdateTaskProgress(
  ids: number[],
  progress: number
): Promise<BatchOperationResult> {
  return batchUpdateTasks(ids, { progress });
}

/**
 * 批量更新任务截止日期
 */
export async function batchUpdateTaskDueDate(
  ids: number[],
  dueDate: string | null
): Promise<BatchOperationResult> {
  return batchUpdateTasks(ids, { dueDate });
}

/**
 * 批量设置任务提醒
 */
export async function batchSetTaskReminder(
  ids: number[],
  isReminderOn: boolean,
  reminderTime?: string
): Promise<BatchOperationResult> {
  return batchUpdateTasks(ids, { isReminderOn, reminderTime });
}
