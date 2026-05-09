import api from '@/services/api';
import type { Comment, PaginatedResult } from '@/types/models';

export interface CommentListParams {
  page: number;
  pageSize: number;
}

export interface CreateCommentPayload {
  content: string;
  parentId?: number;
}

export async function fetchComments(
  taskId: number,
  params: CommentListParams
): Promise<PaginatedResult<Comment>> {
  const { data } = await api.get(`/tasks/${taskId}/comments`, { params });
  return data;
}

export async function createComment(
  taskId: number,
  payload: CreateCommentPayload
): Promise<Comment> {
  const { data } = await api.post(`/tasks/${taskId}/comments`, payload);
  return data;
}

export async function deleteComment(id: number): Promise<void> {
  await api.delete(`/comments/${id}`);
}
