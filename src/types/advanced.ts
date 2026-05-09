export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
    dailyDigest: boolean;
  };
  defaultView: 'list' | 'board' | 'calendar';
}

export interface TagStats {
  id: number;
  name: string;
  color: string;
  usageCount: number;
  lastUsedAt: string;
}

export interface ReportOverview {
  totalCreated: number;
  totalCompleted: number;
  completionRate: number;
  avgCompletionTime: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

export interface ReportTrendItem {
  date: string;
  created: number;
  completed: number;
}

export interface TeamPerformanceItem {
  userId: number;
  userName: string;
  assignedTasks: number;
  completedTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  efficiency: number;
}

export interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  targetType: string;
  targetId: number;
  targetName?: string;
  details: string;
  createdAt: string;
}

export interface SavedFilter {
  id: number;
  name: string;
  config: any;
  isPublic: boolean;
  userId: number;
}

export interface CreateSavedFilterPayload {
  name: string;
  config: any;
  isPublic?: boolean;
}
