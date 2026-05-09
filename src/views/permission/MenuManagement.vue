<template>
  <div class="menu-management">
    <div class="page-header">
      <h2>菜单管理</h2>
      <el-button
        type="primary"
        @click="handleAddMenu"
        :icon="Plus"
      >
        新增菜单
      </el-button>
    </div>

    <!-- 菜单列表 -->
    <el-card
      shadow="never"
      class="menu-list-card"
    >
      <el-table
        v-loading="loading"
        :data="menus"
        stripe
        border
        class="menu-table"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          align="center"
        />
        <el-table-column
          prop="title"
          label="菜单名称"
        >
          <template #default="{ row }">
            <div class="menu-title">
              <el-icon
                v-if="row.type === 'menu'"
                :size="16"
                ><Menu
              /></el-icon>
              <el-icon
                v-else
                :size="16"
                ><Operation
              /></el-icon>
              <span :style="{ marginLeft: `${row.parentId ? 20 : 0}px` }">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="菜单标识"
          width="150"
        />
        <el-table-column
          prop="type"
          label="类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'menu' ? 'success' : 'info'"
              size="small"
            >
              {{ row.type === 'menu' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="path"
          label="路径"
        />
        <el-table-column
          prop="icon"
          label="图标"
          width="120"
        >
          <template #default="{ row }">
            <el-icon :size="18"><component :is="resolveIcon(row.icon)" /></el-icon>
            <span class="icon-name">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="order"
          label="排序"
          width="80"
          align="center"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
              :disabled="row.id === 1"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              @click="handleEditMenu(row)"
              :disabled="row.id === 1"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              text
              @click="handleDeleteMenu(row)"
              :disabled="row.id === 1 || row.children?.length > 0"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 菜单表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="menuRules"
        label-width="100px"
      >
        <el-form-item
          label="菜单名称"
          prop="title"
        >
          <el-input
            v-model="menuForm.title"
            placeholder="请输入菜单名称"
          />
        </el-form-item>
        <el-form-item
          label="菜单标识"
          prop="name"
        >
          <el-input
            v-model="menuForm.name"
            placeholder="请输入菜单标识"
          />
        </el-form-item>
        <el-form-item
          label="类型"
          prop="type"
        >
          <el-radio-group v-model="menuForm.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="路径"
          prop="path"
        >
          <el-input
            v-model="menuForm.path"
            placeholder="请输入路径"
          />
        </el-form-item>
        <el-form-item
          label="图标"
          prop="icon"
        >
          <el-input
            v-model="menuForm.icon"
            placeholder="请输入图标名称"
          />
        </el-form-item>
        <el-form-item label="父菜单">
          <el-select
            v-model="menuForm.parentId"
            placeholder="请选择父菜单"
            :disabled="isButton"
          >
            <el-option
              v-for="menu in parentMenuOptions"
              :key="menu.id"
              :label="menu.title"
              :value="menu.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="排序"
          prop="order"
        >
          <el-input-number
            v-model="menuForm.order"
            :min="1"
            :step="1"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="menuForm.status">
            <el-radio label="active">激活</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Menu, Operation, Plus } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox, FormRules } from 'element-plus';
import { computed, onMounted, ref } from 'vue';

import { createMenu, deleteMenu, getMenus, updateMenu } from '@/services/permissionService';
import type { CreateMenuForm, Menu as MenuType, UpdateMenuForm } from '@/types/models';

// 菜单数据
const menus = ref<MenuType[]>([]);
const loading = ref(false);
const submitting = ref(false);

// 表单数据
const menuFormRef = ref<FormInstance | null>(null);
const dialogVisible = ref(false);
const dialogTitle = ref('新增菜单');
const editingMenuId = ref<number | null>(null);

const menuForm = ref<CreateMenuForm | UpdateMenuForm>({
  name: '',
  title: '',
  type: 'menu',
  path: '',
  icon: '',
  parentId: null,
  order: 1,
  status: 'active',
});

const menuRules = ref<FormRules>({
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  name: [{ required: true, message: '请输入菜单标识', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  path: [{ required: true, message: '请输入路径', trigger: 'blur' }],
  order: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
});

// 计算属性
const isButton = computed(() => menuForm.value.type === 'button');
const parentMenuOptions = computed(() => {
  return menus.value
    .filter((menu) => menu.type === 'menu')
    .map((menu) => ({
      id: menu.id,
      title: menu.title,
    }));
});

// 图标解析函数
function resolveIcon(iconName: string) {
  // 这里简化处理，实际项目中可能需要更复杂的图标映射
  return iconName;
}

// 加载菜单数据
async function loadMenus() {
  loading.value = true;
  try {
    const data = await getMenus();
    menus.value = data;
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载菜单失败');
  } finally {
    loading.value = false;
  }
}

// 新增菜单
function handleAddMenu() {
  dialogTitle.value = '新增菜单';
  editingMenuId.value = null;
  menuForm.value = {
    name: '',
    title: '',
    type: 'menu',
    path: '',
    icon: '',
    parentId: null,
    order: 1,
    status: 'active',
  };
  menuFormRef.value?.resetFields();
  dialogVisible.value = true;
}

// 编辑菜单
function handleEditMenu(menu: MenuType) {
  dialogTitle.value = '编辑菜单';
  editingMenuId.value = menu.id;
  menuForm.value = {
    name: menu.name,
    title: menu.title,
    type: menu.type,
    path: menu.path,
    icon: menu.icon,
    parentId: menu.parentId,
    order: menu.order,
    status: menu.status,
  };
  dialogVisible.value = true;
}

// 删除菜单
async function handleDeleteMenu(menu: MenuType) {
  try {
    await ElMessageBox.confirm(`确定要删除菜单 "${menu.title}" 吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
    await deleteMenu(menu.id);
    ElMessage.success('删除成功');
    loadMenus();
  } catch (error) {
    // 取消删除
  }
}

// 提交表单
async function handleSubmit() {
  if (!menuFormRef.value) return;

  await menuFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (editingMenuId.value) {
          await updateMenu(editingMenuId.value, menuForm.value as UpdateMenuForm);
          ElMessage.success('更新成功');
        } else {
          await createMenu(menuForm.value as CreateMenuForm);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        loadMenus();
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '操作失败');
      } finally {
        submitting.value = false;
      }
    }
  });
}

// 改变菜单状态
async function handleStatusChange(menu: MenuType) {
  try {
    await updateMenu(menu.id, { status: menu.status });
    ElMessage.success('状态更新成功');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '状态更新失败');
    // 恢复原状态
    loadMenus();
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadMenus();
});
</script>

<style scoped>
.menu-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1565c0;
}

.menu-table {
  width: 100%;
}

.menu-title {
  display: flex;
  align-items: center;
}

.icon-name {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
}

.menu-list-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
