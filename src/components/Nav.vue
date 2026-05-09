<template>
  <div class="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
    <div class="relative flex items-center justify-between">
      <div class="flex items-center flex-1">
        <a
          href="/"
          aria-label="Task Flow"
          title="Task Flow"
          class="inline-flex items-center mr-8"
        >
          <svg
            class="w-8 text-blue-accent-400"
            viewBox="0 0 24 24"
            stroke-linejoin="round"
            stroke-width="2"
            stroke-linecap="round"
            stroke-miterlimit="10"
            stroke="currentColor"
            fill="none"
          >
            <rect
              x="3"
              y="1"
              width="7"
              height="12"
            ></rect>
            <rect
              x="3"
              y="17"
              width="7"
              height="6"
            ></rect>
            <rect
              x="14"
              y="1"
              width="7"
              height="6"
            ></rect>
            <rect
              x="14"
              y="11"
              width="7"
              height="12"
            ></rect>
          </svg>
          <span class="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase"
            >Task Flow</span
          >
        </a>
        <ul class="hidden lg:flex items-center space-x-8">
          <li v-if="userStore.isAdmin">
            <a
              href="/dashboard"
              aria-label="仪表盘"
              title="仪表盘"
              class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
              >仪表盘</a
            >
          </li>
          <li>
            <a
              href="/tasks"
              aria-label="任务"
              title="任务"
              class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
              >任务</a
            >
          </li>
          <li>
            <a
              href="/groups"
              aria-label="群组"
              title="群组"
              class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
              >群组</a
            >
          </li>
          <li>
            <a
              href="/profile"
              aria-label="个人资料"
              title="个人资料"
              class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
              >个人资料</a
            >
          </li>
          <li>
            <a
              href="/permission"
              aria-label="权限管理"
              title="权限管理"
              class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
              >权限管理</a
            >
          </li>
          <li>
            <a
              href="/settings"
              aria-label="设置"
              title="设置"
              class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
              >设置</a
            >
          </li>
        </ul>
      </div>
      <ul class="flex items-center space-x-4 lg:space-x-6">
        <li v-if="userStore.isAuthenticated">
          <a
            href="/inbox"
            aria-label="收件箱"
            title="收件箱"
            class="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-blue-50 transition-colors duration-200"
          >
            <svg
              class="w-5 h-5 text-gray-700 hover:text-blue-accent-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              ></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ unreadCount }}
            </span>
          </a>
        </li>
        <li v-if="!userStore.isAuthenticated">
          <a
            href="/login"
            aria-label="登录"
            title="登录"
            class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400 px-4 py-2 rounded-lg hover:bg-blue-50"
            >登录</a
          >
        </li>
        <li v-else>
          <a
            href="/profile"
            aria-label="个人资料"
            title="个人资料"
            class="flex items-center gap-2 font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400 px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <span>{{ userStore.currentUser?.name || '用户' }}</span>
            <img
              v-if="userStore.currentUser?.avatar"
              :src="userStore.currentUser.avatar"
              alt="avatar"
              class="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200"
            >
              {{ (userStore.currentUser?.name || 'U').charAt(0).toUpperCase() }}
            </div>
          </a>
        </li>
        <li>
          <a
            v-if="userStore.isAuthenticated"
            href="/"
            @click.prevent="handleLogout"
            class="inline-flex items-center justify-center h-10 px-5 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md bg-blue-accent-400 hover:bg-blue-accent-700 focus:shadow-outline focus:outline-none"
            aria-label="退出登录"
            title="退出登录"
          >
            退出登录
          </a>
          <a
            v-else
            href="/register"
            class="inline-flex items-center justify-center h-10 px-5 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md bg-blue-accent-400 hover:bg-blue-accent-700 focus:shadow-outline focus:outline-none"
            aria-label="注册"
            title="注册"
          >
            注册
          </a>
        </li>
      </ul>
      <div class="lg:hidden">
        <button
          aria-label="打开菜单"
          title="打开菜单"
          class="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-blue-50 focus:bg-blue-50"
          @click="isMenuOpen = true"
        >
          <svg
            class="w-5 text-gray-600"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M23,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,13,23,13z"
            ></path>
            <path
              fill="currentColor"
              d="M23,6H1C0.4,6,0,5.6,0,5s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,6,23,6z"
            ></path>
            <path
              fill="currentColor"
              d="M23,20H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,20,23,20z"
            ></path>
          </svg>
        </button>
        <div
          v-if="isMenuOpen"
          class="absolute top-0 left-0 w-full"
        >
          <div class="p-5 bg-white border rounded shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div>
                <a
                  href="/"
                  aria-label="Task Flow"
                  title="Task Flow"
                  class="inline-flex items-center"
                >
                  <svg
                    class="w-8 text-blue-accent-400"
                    viewBox="0 0 24 24"
                    stroke-linejoin="round"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke="currentColor"
                    fill="none"
                  >
                    <rect
                      x="3"
                      y="1"
                      width="7"
                      height="12"
                    ></rect>
                    <rect
                      x="3"
                      y="17"
                      width="7"
                      height="6"
                    ></rect>
                    <rect
                      x="14"
                      y="1"
                      width="7"
                      height="6"
                    ></rect>
                    <rect
                      x="14"
                      y="11"
                      width="7"
                      height="12"
                    ></rect>
                  </svg>
                  <span class="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase"
                    >Task Flow</span
                  >
                </a>
              </div>
              <div>
                <button
                  aria-label="关闭菜单"
                  title="关闭菜单"
                  class="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                  @click="isMenuOpen = false"
                >
                  <svg
                    class="w-5 text-gray-600"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <nav>
              <ul class="space-y-4">
                <li v-if="userStore.isAdmin">
                  <a
                    href="/dashboard"
                    aria-label="仪表盘"
                    title="仪表盘"
                    class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
                    @click="isMenuOpen = false"
                    >仪表盘</a
                  >
                </li>
                <li>
                  <a
                    href="/tasks"
                    aria-label="任务"
                    title="任务"
                    class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
                    @click="isMenuOpen = false"
                    >任务</a
                  >
                </li>
                <li>
                  <a
                    href="/profile"
                    aria-label="个人资料"
                    title="个人资料"
                    class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
                    @click="isMenuOpen = false"
                    >个人资料</a
                  >
                </li>
                <li>
                  <a
                    href="/permission"
                    aria-label="权限管理"
                    title="权限管理"
                    class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
                    @click="isMenuOpen = false"
                    >权限管理</a
                  >
                </li>
                <li>
                  <a
                    href="/settings"
                    aria-label="设置"
                    title="设置"
                    class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
                    @click="isMenuOpen = false"
                    >设置</a
                  >
                </li>
                <li v-if="userStore.isAuthenticated">
                  <a
                    href="/inbox"
                    aria-label="收件箱"
                    title="收件箱"
                    class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
                    @click="isMenuOpen = false"
                    >收件箱</a
                  >
                </li>
                <li v-if="userStore.isAuthenticated">
                  <a
                    href="/profile"
                    aria-label="个人中心"
                    title="个人中心"
                    class="flex items-center gap-2 font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
                    @click="isMenuOpen = false"
                  >
                    <span>{{ userStore.currentUser?.name || '用户' }}</span>
                    <img
                      v-if="userStore.currentUser?.avatar"
                      :src="userStore.currentUser.avatar"
                      alt="avatar"
                      class="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <div
                      v-else
                      class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200"
                    >
                      {{ (userStore.currentUser?.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                  </a>
                </li>
                <li v-else>
                  <a
                    href="/login"
                    aria-label="登录"
                    title="登录"
                    class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-blue-accent-400"
                    @click="isMenuOpen = false"
                    >登录</a
                  >
                </li>
                <li>
                  <a
                    v-if="userStore.isAuthenticated"
                    href="/"
                    @click.prevent="handleLogout"
                    class="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-blue-accent-400 hover:bg-blue-accent-700 focus:shadow-outline focus:outline-none"
                    aria-label="退出登录"
                    title="退出登录"
                  >
                    退出登录
                  </a>
                  <a
                    v-else
                    href="/register"
                    class="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-blue-accent-400 hover:bg-blue-accent-700 focus:shadow-outline focus:outline-none"
                    aria-label="注册"
                    title="注册"
                    @click="isMenuOpen = false"
                  >
                    注册
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { getUnreadNotificationCount } from '@/services/notificationService';
import { useUserStore } from '@/store/user';

const isMenuOpen = ref(false);
const userStore = useUserStore();
const router = useRouter();
const unreadCount = ref(0);

const handleLogout = () => {
  userStore.logout();
  isMenuOpen.value = false;
  router.push('/login');
};

async function loadUnreadCount() {
  if (userStore.isAuthenticated) {
    try {
      const result = await getUnreadNotificationCount();
      unreadCount.value = result.count;
    } catch (error) {
      console.error('加载未读通知数量失败:', error);
    }
  }
}

onMounted(() => {
  loadUnreadCount();
  // 每30秒刷新一次未读计数
  setInterval(loadUnreadCount, 30000);
});

watch(
  () => userStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      loadUnreadCount();
    } else {
      unreadCount.value = 0;
    }
  }
);
</script>

<script lang="ts">
export default {
  name: 'AppNav',
};
</script>
