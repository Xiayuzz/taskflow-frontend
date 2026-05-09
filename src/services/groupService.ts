import type {
  AddGroupMemberForm,
  CreateGroupForm,
  Group,
  GroupMember,
  PaginatedResult,
  UpdateGroupForm,
} from '@/types/models';

import api from './api';

export async function getGroups(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<PaginatedResult<Group>> {
  const response = await api.get('/api/groups', { params });
  return response.data;
}

export async function getGroupById(id: number): Promise<Group> {
  const response = await api.get(`/api/groups/${id}`);
  return response.data.data;
}

export async function createGroup(data: CreateGroupForm): Promise<Group> {
  const response = await api.post('/api/groups', data);
  return response.data.data;
}

export async function updateGroup(id: number, data: UpdateGroupForm): Promise<Group> {
  const response = await api.put(`/api/groups/${id}`, data);
  return response.data.data;
}

export async function deleteGroup(id: number): Promise<void> {
  await api.delete(`/api/groups/${id}`);
}

export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  const response = await api.get(`/api/groups/${groupId}/members`);
  return response.data.items;
}

export async function addGroupMember(
  groupId: number,
  data: AddGroupMemberForm
): Promise<GroupMember> {
  const response = await api.post(`/api/groups/${groupId}/members`, data);
  return response.data.data;
}

export async function removeGroupMember(groupId: number, userId: number): Promise<void> {
  await api.delete(`/api/groups/${groupId}/members/${userId}`);
}

export async function getGroupTasks(
  groupId: number,
  params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
  }
): Promise<PaginatedResult<any>> {
  const response = await api.get(`/api/groups/${groupId}/tasks`, { params });
  return response.data;
}

export async function getAllGroupTasks(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  groupId?: number;
}): Promise<PaginatedResult<any>> {
  const response = await api.get('/api/groups/tasks/all', { params });
  return response.data;
}
