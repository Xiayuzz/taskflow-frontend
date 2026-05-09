import type {
  CreateMenuForm,
  CreateUserForm,
  Menu,
  PaginatedResult,
  Role,
  UpdateMenuForm,
  UpdateUserForm,
  UpdateUserPermissionForm,
  User,
  UserPermission,
} from '@/types/models';

import api from './api';

// 菜单管理相关 API
export async function getMenus(params?: {
  parentId?: number;
  status?: string;
  type?: string;
}): Promise<Menu[]> {
  const response = await api.get('/api/menus', { params });
  return response.data.data;
}

export async function createMenu(data: CreateMenuForm): Promise<Menu> {
  const response = await api.post('/api/menus', data);
  return response.data.data;
}

export async function updateMenu(id: number, data: UpdateMenuForm): Promise<Menu> {
  const response = await api.put(`/api/menus/${id}`, data);
  return response.data.data;
}

export async function deleteMenu(id: number): Promise<void> {
  await api.delete(`/api/menus/${id}`);
}

// 角色管理相关 API
export async function getRoles(): Promise<Role[]> {
  const response = await api.get('/api/roles');
  return response.data.data;
}

// 用户管理相关 API
export async function getUsers(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  role?: string;
}): Promise<PaginatedResult<User>> {
  const response = await api.get('/api/users', { params });
  return {
    items: response.data.items,
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.pageSize,
  };
}

export async function getUserById(id: number): Promise<User> {
  const response = await api.get(`/api/users/${id}`);
  return response.data.data;
}

export async function createUser(data: CreateUserForm): Promise<User> {
  const response = await api.post('/api/users', data);
  return response.data.data;
}

export async function updateUser(id: number, data: UpdateUserForm): Promise<User> {
  const response = await api.put(`/api/users/${id}`, data);
  return response.data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/users/${id}`);
}

// 用户权限管理相关 API
export async function getUserPermissions(id: number): Promise<UserPermission> {
  const response = await api.get(`/api/users/${id}/permissions`);
  return response.data.data;
}

export async function updateUserPermissions(
  id: number,
  data: UpdateUserPermissionForm
): Promise<UserPermission> {
  const response = await api.put(`/api/users/${id}/permissions`, data);
  return response.data.data;
}
