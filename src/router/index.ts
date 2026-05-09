import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import { useUserStore } from '@/store/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/TaskListView.vue'),
  },
  {
    path: '/tasks/:id',
    name: 'taskDetail',
    component: () => import('@/views/TaskDetailView.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
  },
  {
    path: '/permission',
    name: 'permission',
    component: () => import('@/views/permission/Index.vue'),
    children: [
      {
        path: 'menus',
        name: 'permissionMenus',
        component: () => import('@/views/permission/MenuManagement.vue'),
      },
      {
        path: 'users',
        name: 'permissionUsers',
        component: () => import('@/views/permission/UserManagement.vue'),
      },
      {
        path: 'user-permissions/:id',
        name: 'userPermissions',
        component: () => import('@/views/permission/UserPermissionManagement.vue'),
      },
    ],
  },
  {
    path: '/groups',
    name: 'groups',
    component: () => import('@/views/GroupsView.vue'),
  },
  {
    path: '/groups/create',
    name: 'createGroup',
    component: () => import('@/views/GroupCreateView.vue'),
  },
  {
    path: '/groups/:id',
    name: 'groupDetail',
    component: () => import('@/views/GroupDetailView.vue'),
  },
  {
    path: '/groups/:id/edit',
    name: 'editGroup',
    component: () => import('@/views/GroupEditView.vue'),
  },
  {
    path: '/groups/manage',
    name: 'manageGroups',
    component: () => import('@/views/GroupsView.vue'), // 复用群组列表页
  },
  {
    path: '/groups/tasks',
    name: 'groupTasks',
    component: () => import('@/views/GroupTasksView.vue'),
  },
  {
    path: '/team',
    name: 'team',
    component: () => import('@/views/TeamView.vue'),
  },
  {
    path: '/tasks/create',
    name: 'createTask',
    component: () => import('@/views/TaskCreateView.vue'),
  },
  {
    path: '/reminders',
    name: 'reminders',
    component: () => import('@/views/RemindersView.vue'),
  },
  {
    path: '/inbox',
    name: 'inbox',
    component: () => import('@/views/InboxView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('@/views/TagsView.vue'),
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/ReportsView.vue'),
  },
  {
    path: '/activity',
    name: 'activity',
    component: () => import('@/views/ActivityView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to: any, _from: any, next: any) => {
  const userStore = useUserStore();
  const isPublic = to.matched.some((record: any) => record.meta && record.meta.public);

  // If route is public
  if (isPublic) {
    // If user is already authenticated and visiting login, redirect back or to dashboard
    if (to.path === '/login' && userStore.isAuthenticated) {
      const redirect = (to.query.redirect as string) || '/dashboard';
      return next(redirect);
    }
    return next();
  }

  // Protected route: require authentication
  if (!userStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  // Admin route: require admin role
  if (to.matched.some((record: any) => record.meta && record.meta.requiresAdmin)) {
    if (!userStore.isAdmin) {
      // Redirect non-admin users to tasks page
      return next('/tasks');
    }
  }

  next();
});

export default router;
