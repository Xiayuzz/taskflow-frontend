import type { PaginatedResult, User, UserSearchParams } from '@/types/models';

import api from './api';

export async function searchUsers(params: UserSearchParams) {
  const { data } = await api.get<{ data: PaginatedResult<User> }>('/users/search', { params });
  return data.data;
}

export async function getUserById(id: number) {
  const { data } = await api.get<{ data: User }>(`/users/${id}`);
  return data.data;
}

export async function getProfile() {
  const { data } = await api.get<{ data: User }>('/users/me');
  return data.data;
}

export async function updateProfile(payload: Partial<User>) {
  const { data } = await api.put<{ data: User }>('/users/me', payload);
  return data.data;
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await api.post('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export default { getProfile, updateProfile, uploadAvatar, searchUsers, getUserById };
