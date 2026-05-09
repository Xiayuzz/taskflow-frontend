import type { TaskAttachment } from '@/types/models';

import api from './api';

/**
 * 上传附件
 */
export async function uploadAttachment(
  taskId: number,
  file: File,
  description?: string
): Promise<TaskAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }

  const response = await api.post(`/api/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * 获取任务附件列表
 */
export async function getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
  const response = await api.get(`/api/tasks/${taskId}/attachments`);
  return response.data.items;
}

/**
 * 删除附件
 */
export async function deleteAttachment(attachmentId: number): Promise<void> {
  await api.delete(`/api/tasks/attachments/${attachmentId}`);
}

/**
 * 下载附件
 */
export async function downloadAttachment(attachmentId: number): Promise<Blob> {
  const response = await api.get(`/api/tasks/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * 更新附件描述
 */
export async function updateAttachmentDescription(
  attachmentId: number,
  description: string
): Promise<TaskAttachment> {
  const response = await api.patch(`/api/tasks/attachments/${attachmentId}`, { description });
  return response.data;
}
