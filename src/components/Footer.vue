<template>
  <div class="relative mt-16 bg-blue-accent-400">
    <svg
      class="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-blue-accent-400"
      preserveAspectRatio="none"
      viewBox="0 0 1440 54"
    >
      <path
        fill="currentColor"
        d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
      ></path>
    </svg>
    <div class="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
      <div class="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
        <div class="md:max-w-md lg:col-span-2">
          <a
            href="/"
            aria-label="Go home"
            title="Task Flow"
            class="inline-flex items-center"
          >
            <svg
              class="w-8 text-teal-accent-400"
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
            <span class="ml-2 text-xl font-bold tracking-wide text-gray-100 uppercase"
              >Task Flow</span
            >
          </a>
          <div class="mt-4 lg:max-w-sm">
            <p class="text-sm text-blue-50">
              高效的任务管理系统，帮助您组织和跟踪工作，提高生产力。
            </p>
            <p class="mt-4 text-sm text-blue-50">
              简洁直观的界面设计，强大的功能支持，让任务管理变得轻松高效。
            </p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-5 row-gap-8 lg:col-span-4 md:grid-cols-4">
          <div>
            <p class="font-semibold tracking-wide text-teal-accent-400">任务管理</p>
            <ul class="mt-2 space-y-2">
              <li>
                <a
                  href="/tasks"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >任务列表</a
                >
              </li>
              <li>
                <a
                  href="/tasks/create"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >创建任务</a
                >
              </li>
              <li>
                <a
                  href="/dashboard"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >仪表盘</a
                >
              </li>
            </ul>
          </div>
          <div>
            <p class="font-semibold tracking-wide text-teal-accent-400">团队协作</p>
            <ul class="mt-2 space-y-2">
              <li>
                <a
                  href="/team"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >团队成员</a
                >
              </li>
              <li>
                <a
                  href="/inbox"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >通知中心</a
                >
              </li>
              <li>
                <a
                  href="/activity"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >活动日志</a
                >
              </li>
            </ul>
          </div>
          <div>
            <p class="font-semibold tracking-wide text-teal-accent-400">群组管理</p>
            <ul class="mt-2 space-y-2">
              <li>
                <a
                  href="/groups"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >群组列表</a
                >
              </li>
              <li>
                <a
                  href="/groups/create"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >创建群组</a
                >
              </li>
              <li>
                <a
                  href="/groups/manage"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >管理群组</a
                >
              </li>
              <li>
                <a
                  href="/groups/tasks"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >群组任务</a
                >
              </li>
            </ul>
          </div>
          <div>
            <p class="font-semibold tracking-wide text-teal-accent-400">系统设置</p>
            <ul class="mt-2 space-y-2">
              <li>
                <a
                  href="/profile"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >个人资料</a
                >
              </li>
              <li>
                <a
                  href="/settings"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >系统设置</a
                >
              </li>
              <li>
                <a
                  href="/tags"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >标签管理</a
                >
              </li>
              <li>
                <a
                  href="/reminders"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >提醒设置</a
                >
              </li>
              <li>
                <a
                  href="/reports"
                  class="transition-colors duration-300 text-blue-50 hover:text-teal-accent-400"
                  >统计报表</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        class="flex flex-col justify-between pt-5 pb-10 border-t border-blue-accent-200 sm:flex-row"
      >
        <p class="text-sm text-gray-100">© Copyright 2026 Task Flow. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
