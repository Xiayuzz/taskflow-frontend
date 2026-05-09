<template>
  <div class="permission-container">
    <div class="header">
      <h1>权限管理</h1>
    </div>
    <div class="permission-content">
      <aside class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
        >
          <el-menu-item index="/permission/menus">
            <el-icon><Menu /></el-icon>
            <span>菜单管理</span>
          </el-menu-item>
          <el-menu-item index="/permission/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </aside>
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, User } from '@element-plus/icons-vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const activeMenu = computed(() => {
  return route.path;
});
</script>

<style scoped>
.permission-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1565c0;
}

.permission-content {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 200px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar-menu {
  border-right: none;
}

.main-content {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .permission-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .sidebar-menu {
    display: flex;
    overflow-x: auto;
  }

  .sidebar-menu .el-menu-item {
    flex: 1;
    min-width: 120px;
  }

  .main-content {
    padding: 12px;
  }
}
</style>
