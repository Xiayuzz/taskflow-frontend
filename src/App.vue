<template>
  <div class="app-container">
    <div class="layout">
      <aside
        class="sidebar fixed top-0 left-0 h-full bg-blue-accent-400 text-white shadow-lg transition-all duration-300 ease-in-out z-30"
        :class="{ collapsed }"
      >
        <div class="flex items-center justify-between py-5 px-4 border-b border-blue-700/50">
          <div
            class="logo flex items-center cursor-pointer hover:bg-blue-700/50 transition-colors duration-200 px-2 py-2 rounded-lg"
            @click="toggleCollapse"
          >
            <span class="font-bold text-xl tracking-wider uppercase">TaskFlow</span>
          </div>
          <button
            class="collapse-btn p-2 rounded-lg hover:bg-blue-700/50 transition-colors duration-200 focus:outline-none"
            @click="toggleCollapse"
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
          >
            <span class="w-full">仪表盘</span>
          </RouterLink>
          <RouterLink
            to="/tasks"
            class="item flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/50 hover:translate-x-1"
            :class="isActive('/tasks') ? 'bg-blue-700/80 font-medium' : ''"
          >
            <span class="w-full">任务</span>
          </RouterLink>
        </nav>
        <div
          class="foot py-4 px-4 text-center text-sm text-blue-100/80 border-t border-blue-700/50"
        >
          © 2026
        </div>
      </aside>
      <div class="main flex-1 min-h-0">
        <Nav />
        <main class="content flex-1">
          <RouterView />
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { useUserStore } from '@/store/user';

import Footer from './components/Footer.vue';
import Nav from './components/Nav.vue';

const route = useRoute();
const userStore = useUserStore();
const collapsed = ref(false);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}
function isActive(prefix: string) {
  return route.path.startsWith(prefix) ? 'active' : '';
}
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
  .sidebar {
    position: fixed;
    z-index: 30;
    height: 100%;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  .sidebar:not(.collapsed) {
    transform: translateX(0);
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
    width: 200px;
  }
  .sidebar.collapsed {
    width: 64px;
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
