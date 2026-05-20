<template>
  <div class="app-container">
    <div class="layout">
      <button
        v-if="mobileSidebarOpen"
        class="sidebar-backdrop"
        type="button"
        aria-label="关闭侧边栏"
        @click="closeMobileSidebar"
      ></button>
      <aside
        class="sidebar fixed top-0 left-0 h-full bg-blue-accent-400 text-white shadow-lg transition-all duration-300 ease-in-out z-30"
        :class="{ collapsed, 'mobile-open': mobileSidebarOpen }"
      >
        <div class="flex items-center justify-between py-5 px-4 border-b border-blue-700/50">
          <div
            class="logo flex items-center cursor-pointer hover:bg-blue-700/50 transition-colors duration-200 px-2 py-2 rounded-lg"
            @click="handleSidebarToggle"
          >
            <span class="font-bold text-xl tracking-wider uppercase">TaskFlow</span>
          </div>
          <button
            class="collapse-btn p-2 rounded-lg hover:bg-blue-700/50 transition-colors duration-200 focus:outline-none"
            @click="handleSidebarToggle"
            aria-label="Toggle Sidebar"
          >
            <svg
              class="w-5 h-5 transition-transform duration-300"
              :class="{ 'rotate-180': collapsed }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
        </div>
        <nav class="menu flex-1 p-4 space-y-2">
          <RouterLink
            v-if="userStore.isAdmin"
            to="/dashboard"
            class="item flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/50 hover:translate-x-1"
            :class="isActive('/dashboard') ? 'bg-blue-700/80 font-medium' : ''"
            @click="closeMobileSidebar"
          >
            <span class="w-full">仪表盘</span>
          </RouterLink>
          <RouterLink
            to="/tasks"
            class="item flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/50 hover:translate-x-1"
            :class="isActive('/tasks') ? 'bg-blue-700/80 font-medium' : ''"
            @click="closeMobileSidebar"
          >
            <span class="w-full">任务</span>
          </RouterLink>
          <RouterLink
            to="/groups"
            class="item flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/50 hover:translate-x-1"
            :class="isActive('/groups') ? 'bg-blue-700/80 font-medium' : ''"
            @click="closeMobileSidebar"
          >
            <span class="w-full">群组</span>
          </RouterLink>
          <RouterLink
            to="/inbox"
            class="item flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/50 hover:translate-x-1"
            :class="isActive('/inbox') ? 'bg-blue-700/80 font-medium' : ''"
            @click="closeMobileSidebar"
          >
            <span class="w-full">收件箱</span>
          </RouterLink>
          <RouterLink
            to="/profile"
            class="item flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/50 hover:translate-x-1"
            :class="isActive('/profile') ? 'bg-blue-700/80 font-medium' : ''"
            @click="closeMobileSidebar"
          >
            <span class="w-full">个人资料</span>
          </RouterLink>
          <RouterLink
            v-if="userStore.isAdmin"
            to="/permission"
            class="item flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/50 hover:translate-x-1"
            :class="isActive('/permission') ? 'bg-blue-700/80 font-medium' : ''"
            @click="closeMobileSidebar"
          >
            <span class="w-full">权限管理</span>
          </RouterLink>
          <RouterLink
            to="/settings"
            class="item flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/50 hover:translate-x-1"
            :class="isActive('/settings') ? 'bg-blue-700/80 font-medium' : ''"
            @click="closeMobileSidebar"
          >
            <span class="w-full">设置</span>
          </RouterLink>
        </nav>
        <div
          class="foot py-4 px-4 text-sm text-blue-100/80 border-t border-blue-700/50"
        >
          <button
            v-if="userStore.isAuthenticated"
            type="button"
            class="sidebar-auth-action"
            @click="handleLogout"
          >
            退出登录
          </button>
          <RouterLink
            v-else
            to="/login"
            class="sidebar-auth-action"
            @click="closeMobileSidebar"
          >
            登录
          </RouterLink>
          <div class="copyright">© 2026</div>
        </div>
      </aside>
      <div class="main flex-1 min-h-0">
        <Nav @toggle-sidebar="toggleMobileSidebar" />
        <main class="content flex-1">
          <RouterView />
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useUserStore } from '@/store/user';

import Footer from './components/Footer.vue';
import Nav from './components/Nav.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const collapsed = ref(false);
const mobileSidebarOpen = ref(false);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}
function handleSidebarToggle() {
  if (mobileSidebarOpen.value) {
    closeMobileSidebar();
    return;
  }
  toggleCollapse();
}
function toggleMobileSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
}
function closeMobileSidebar() {
  mobileSidebarOpen.value = false;
}
function isActive(prefix: string) {
  return route.path.startsWith(prefix) ? 'active' : '';
}
function handleLogout() {
  userStore.logout();
  closeMobileSidebar();
  router.push('/login');
}

watch(
  () => route.path,
  () => {
    closeMobileSidebar();
  }
);
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout {
  display: flex;
  flex: 1;
}
.sidebar {
  width: 220px;
  display: flex;
  flex-direction: column;
}
.sidebar.collapsed {
  width: 64px;
}
.sidebar.collapsed .logo {
  padding: 5px 4px;
}
.sidebar.collapsed .logo span {
  font-size: 0;
}
.sidebar.collapsed .menu {
  padding: 4px;
}
.sidebar.collapsed .menu .item {
  padding: 3px 4px;
  justify-content: center;
}
.sidebar.collapsed .menu .item span {
  display: none;
}
.sidebar.collapsed .foot {
  padding: 4px 2px;
  font-size: 10px;
}
.sidebar.collapsed .sidebar-auth-action {
  display: none;
}
.sidebar-auth-action {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(219, 234, 254, 0.35);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}
.sidebar-auth-action:hover {
  background: rgba(255, 255, 255, 0.18);
}
.copyright {
  margin-top: 10px;
  text-align: center;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f8fd;
  margin-left: 220px;
  transition: margin-left 0.3s ease-in-out;
}

.sidebar.collapsed + .main {
  margin-left: 64px;
}

.sidebar-backdrop {
  display: none;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e5eaf1;
}
.content {
  padding: 20px;
  flex: 1;
  overflow: auto;
}

.breadcrumbs {
  margin-bottom: 16px;
}
.user-trigger {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.mr-2 {
  margin-right: 8px;
}
@media (max-width: 768px) {
  .layout {
    position: relative;
  }

  .sidebar {
    position: fixed;
    z-index: 50;
    height: 100%;
    left: 0;
    top: 0;
    width: min(82vw, 280px);
    transform: translateX(-100%) !important;
    transition: transform 0.3s ease-in-out;
  }

  .sidebar.mobile-open {
    transform: translateX(0) !important;
  }

  .sidebar.collapsed {
    width: min(82vw, 280px);
  }

  .sidebar.collapsed .logo {
    padding: 0.5rem;
  }

  .sidebar.collapsed .logo span {
    display: inline;
    font-size: 1.25rem;
  }

  .sidebar.collapsed .menu {
    padding: 1rem;
  }

  .sidebar.collapsed .menu .item {
    justify-content: flex-start;
    padding: 0.75rem 1rem;
  }

  .sidebar.collapsed .menu .item span {
    display: block;
  }

  .sidebar.collapsed .sidebar-auth-action {
    display: flex;
  }

  .sidebar.collapsed .foot {
    padding: 1rem;
    font-size: 14px;
  }

  .sidebar-auth-action {
    min-height: 48px;
    font-size: 16px;
    line-height: 1.2;
  }

  .copyright {
    font-size: 14px;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    border: 0;
    background: rgba(15, 23, 42, 0.42);
    cursor: pointer;
  }

  .main {
    margin-left: 0 !important;
    width: 100%;
  }
  .sidebar.collapsed + .main {
    margin-left: 0 !important;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .header h1 {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: min(86vw, 260px);
  }
  .sidebar.collapsed {
    width: min(86vw, 260px);
  }
  .content {
    padding: 12px;
  }
  .footer {
    padding: 12px;
    font-size: 12px;
  }
}
</style>
