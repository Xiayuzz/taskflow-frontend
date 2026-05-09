import { defineStore } from 'pinia';

import type {
  AdvancedSearchResult,
  BatchOperationResult,
  Task,
  TaskPriority,
  TaskReminder,
  TaskStatus,
  TaskTag,
} from '@/types/models';

interface AdvancedFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: number[];
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
}

interface State {
  list: Task[];
  current: Task | null;
  loading: boolean;
  filters: AdvancedFilters;
  total: number;
  // 高级搜索相关
  searchResults: Task[];
  searchTotal: number;
  appliedFilters: Record<string, any>;
  availableFilters: Record<string, any>;
  // 标签相关
  tags: TaskTag[];
  tagsLoading: boolean;
  // 提醒相关
  reminders: TaskReminder[];
  remindersLoading: boolean;
  // 批量操作相关
  batchOperationResult: BatchOperationResult | null;
  batchOperationLoading: boolean;
}

export const useTaskStore = defineStore('task', {
  state: (): State => ({
    list: [],
    current: null,
    loading: false,
    filters: {},
    total: 0,
    // 高级搜索相关
    searchResults: [],
    searchTotal: 0,
    appliedFilters: {},
    availableFilters: {},
    // 标签相关
    tags: [],
    tagsLoading: false,
    // 提醒相关
    reminders: [],
    remindersLoading: false,
    // 批量操作相关
    batchOperationResult: null,
    batchOperationLoading: false,
  }),
  actions: {
    // 基础操作
    setTasks(tasks: Task[]) {
      this.list = tasks;
    },
    setTotal(total: number) {
      this.total = total;
    },
    setPage(result: any) {
      this.list = result.items;
      this.total = result.total;
    },
    setCurrent(task: Task | null) {
      this.current = task;
    },
    upsert(task: Task) {
      const idx = this.list.findIndex((t: Task) => t.id === task.id);
      if (idx >= 0) this.list[idx] = task;
      else this.list.push(task);

      // 同时更新搜索结果中的任务
      const searchIdx = this.searchResults.findIndex((t: Task) => t.id === task.id);
      if (searchIdx >= 0) this.searchResults[searchIdx] = task;
    },
    removeTask(taskId: number) {
      this.list = this.list.filter((t: Task) => t.id !== taskId);
      this.searchResults = this.searchResults.filter((t: Task) => t.id !== taskId);
      if (this.current?.id === taskId) {
        this.current = null;
      }
    },
    clearCurrent() {
      this.current = null;
    },

    // 筛选相关
    setFilters(f: Partial<AdvancedFilters>) {
      this.filters = { ...this.filters, ...f };
    },
    resetFilters() {
      this.filters = {};
    },

    // 高级搜索相关
    setSearchResults(result: AdvancedSearchResult<Task>) {
      this.searchResults = result.items;
      this.searchTotal = result.total;
      this.appliedFilters = result.filters.applied;
      this.availableFilters = result.filters.available;
    },
    clearSearchResults() {
      this.searchResults = [];
      this.searchTotal = 0;
      this.appliedFilters = {};
    },

    // 标签相关
    setTags(tags: TaskTag[]) {
      this.tags = tags;
    },
    addTag(tag: TaskTag) {
      this.tags.push(tag);
    },
    updateTag(updatedTag: TaskTag) {
      const idx = this.tags.findIndex((tag: TaskTag) => tag.id === updatedTag.id);
      if (idx >= 0) {
        this.tags[idx] = updatedTag;
      }
    },
    removeTag(tagId: number) {
      this.tags = this.tags.filter((tag: TaskTag) => tag.id !== tagId);
    },
    setTagsLoading(loading: boolean) {
      this.tagsLoading = loading;
    },

    // 提醒相关
    setReminders(reminders: TaskReminder[]) {
      this.reminders = reminders;
    },
    addReminder(reminder: TaskReminder) {
      this.reminders.push(reminder);
    },
    updateReminder(updatedReminder: TaskReminder) {
      const idx = this.reminders.findIndex((r: TaskReminder) => r.id === updatedReminder.id);
      if (idx >= 0) {
        this.reminders[idx] = updatedReminder;
      }
    },
    removeReminder(reminderId: number) {
      this.reminders = this.reminders.filter((r: TaskReminder) => r.id !== reminderId);
    },
    clearReminders() {
      this.reminders = [];
    },
    setRemindersLoading(loading: boolean) {
      this.remindersLoading = loading;
    },

    // 批量操作相关
    setBatchOperationResult(result: BatchOperationResult) {
      this.batchOperationResult = result;
    },
    clearBatchOperationResult() {
      this.batchOperationResult = null;
    },
    setBatchOperationLoading(loading: boolean) {
      this.batchOperationLoading = loading;
    },
  },
});
