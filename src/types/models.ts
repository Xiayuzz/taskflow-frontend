// 基本领域模型类型定义
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  bio?: string;
  notificationSettings?: {
    email: {
      taskAssigned: boolean;
      taskUpdated: boolean;
      taskCompleted: boolean;
      commentCreated: boolean;
      reminders: boolean;
    };
    sms: {
      taskAssigned: boolean;
      reminders: boolean;
    };
    inApp: {
      all: boolean;
    };
  };
  timezone?: string;
  department?: {
    id: number;
    name: string;
  };
  lastActiveAt?: string;
}

export interface UserSearchParams {
  keyword?: string;
  departmentId?: number;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  excludeIds?: number[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description?: string;
  assigneeId?: number;
  creatorId: number;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  tagIds?: number[];
  estimatedHours?: number;
  actualHours?: number;
  isReminderOn?: boolean;
  reminderTime?: string; // ISO
  attachments?: TaskAttachment[];
  groupId?: number | string;
  assignee?: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
  creator?: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
  group?: {
    id: number;
    name: string;
  };
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  user?: {
    username: string;
    name: string;
    avatar?: string;
  };
  content: string;
  parentId?: number;
  createdAt: string;
  updatedAt?: string;
}

export type ReminderType = 'email' | 'sms' | 'in_app';
export type ReminderStatus = 'pending' | 'sent' | 'failed';

export interface TaskReminder {
  id: number;
  taskId: number;
  userId: number;
  reminderType: ReminderType;
  reminderTime: string; // ISO
  status: ReminderStatus;
  createdAt: string;
  sentAt?: string; // ISO
}

export interface TaskTag {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  description?: string;
  uploadedBy: number;
  uploadedAt: string;
}

// 权限管理相关类型
export type MenuStatus = 'active' | 'inactive';
export type MenuType = 'menu' | 'button';

export interface Menu {
  id: number;
  name: string;
  title: string;
  type: MenuType;
  path: string;
  icon: string;
  parentId: number | null;
  order: number;
  status: MenuStatus;
  createdAt: string;
  updatedAt: string;
  children?: Menu[];
}

export interface Role {
  id: number;
  name: string;
  title: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPermission {
  userId: number;
  permissions: string[];
}

export type StatisticPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface TaskStatistics {
  id: number;
  userId?: number;
  teamId?: number;
  period: StatisticPeriod;
  date: string; // ISO date
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskOverviewStats {
  overview: {
    total: number;
    pending: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  byStatus: {
    pending: number;
    inProgress: number;
    done: number;
  };
  trend: Array<{
    date: string;
    created: number;
    completed: number;
  }>;
  byTag: Record<string, number>;
  byAssignment?: Array<{
    id: number;
    name: string;
    avatar?: string | null;
    assigned: number;
    completed: number;
    inProgress: number;
  }>;
}

export interface UserPerformanceStats {
  userId: number;
  name: string;
  avatar?: string;
  assignedTasks: number;
  completedTasks: number;
  completionRate: number;
  avgCompletionTime: number; // 平均完成时间 (天)
  totalHours: number;
  overdueTasks: number;
  trend: Array<{
    date: string;
    completed: number;
    hours: number;
  }>;
}

export interface TaskCompletionTimeStats {
  avgCompletionTime: number;
  medianCompletionTime: number;
  byGroup: {
    priority: Record<TaskPriority, number>;
    status: Record<TaskStatus, number>;
    assignee?: Record<number, number>;
    tag?: Record<string, number>;
  };
  trend: Array<{
    date: string;
    avgTime: number;
  }>;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change: number;
  changeType: 'increase' | 'decrease';
  period: string;
}

export interface DashboardStats {
  cards: DashboardCard[];
  quickStats: {
    todayTasks: number;
    thisWeekTasks: number;
    thisMonthTasks: number;
    myPendingTasks: number;
  };
}

export interface AdvancedSearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    applied: {
      status?: string[];
      priority?: string[];
      tags?: string[];
      assigneeId?: string[];
      [key: string]: any;
    };
    available: {
      status: string[];
      priority: string[];
      tags: string[];
      [key: string]: any;
    };
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface BatchOperationResult {
  successCount: number;
  failedCount: number;
  failedIds: number[];
}

export interface UserLoadStats {
  userId: number;
  period: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  byStatus: {
    pending: number;
    in_progress: number;
    done: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

// 表单类型
export interface CreateMenuForm {
  name: string;
  title: string;
  type: MenuType;
  path: string;
  icon: string;
  parentId: number | null;
  order: number;
  status: MenuStatus;
}

export interface UpdateMenuForm {
  name?: string;
  title?: string;
  type?: MenuType;
  path?: string;
  icon?: string;
  parentId?: number | null;
  order?: number;
  status?: MenuStatus;
}

export interface CreateUserForm {
  username: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
}

export interface UpdateUserForm {
  name?: string;
  role?: 'admin' | 'user' | 'guest';
  status?: 'active' | 'inactive';
}

export interface UpdateUserPermissionForm {
  permissions: string[];
}

// 任务相关表单类型
export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigneeId?: number | string;
  priority: TaskPriority;
  dueDate?: string; // ISO
  tags?: string[];
  estimatedHours?: number;
  isReminderOn?: boolean;
  reminderTime?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assigneeId?: number | string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  progress?: number;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  isReminderOn?: boolean;
  reminderTime?: string;
}

export interface AssignTaskPayload {
  assigneeId: string | number;
  notify?: boolean;
  message?: string;
}

export interface CreateReminderPayload {
  userId: number;
  reminderType: 'email' | 'sms' | 'in_app';
  reminderTime: string;
}

// 群组和通知相关类型
export type GroupRole = 'owner' | 'admin' | 'member';

export interface Group {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
}

export interface GroupMember {
  id: number;
  userId: number;
  userName: string;
  role: GroupRole;
  joinedAt: string;
}

export type NotificationType =
  | 'task_assigned'
  | 'task_deadline'
  | 'task_completed'
  | 'task_comment'
  | 'group_invitation'
  | 'group_task_assigned'
  | 'system_notification';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: number;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
}

// 群组相关表单类型
export interface CreateGroupForm {
  name: string;
  description: string;
}

export interface UpdateGroupForm {
  name?: string;
  description?: string;
}

export interface AddGroupMemberForm {
  userId: number;
  role: GroupRole;
}
