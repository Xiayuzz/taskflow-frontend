<template>
  <div class="settings-page">
    <div class="header">
      <h1>系统设置</h1>
    </div>

    <el-card
      v-loading="loading"
      shadow="never"
    >
      <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
        style="max-width: 600px"
      >
        <el-divider content-position="left">外观与显示</el-divider>
        <el-form-item label="主题">
          <el-radio-group v-model="form.theme">
            <el-radio label="light">浅色</el-radio>
            <el-radio label="dark">深色</el-radio>
            <el-radio label="system">跟随系统</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="语言">
          <el-select v-model="form.language">
            <el-option
              label="简体中文"
              value="zh-CN"
            />
            <el-option
              label="English"
              value="en-US"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时区">
          <el-select v-model="form.timezone">
            <el-option
              label="Asia/Shanghai"
              value="Asia/Shanghai"
            />
            <el-option
              label="UTC"
              value="UTC"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="默认视图">
          <el-select v-model="form.defaultView">
            <el-option
              label="列表"
              value="list"
            />
            <el-option
              label="看板"
              value="board"
            />
            <el-option
              label="日历"
              value="calendar"
            />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">通知设置</el-divider>
        <el-form-item label="邮件通知">
          <el-switch v-model="form.notifications.email" />
        </el-form-item>
        <el-form-item label="浏览器通知">
          <el-switch v-model="form.notifications.browser" />
        </el-form-item>
        <el-form-item label="每日摘要">
          <el-switch v-model="form.notifications.dailyDigest" />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="saving"
            @click="submit"
            >保存更改</el-button
          >
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

import { getUserPreferences, updateUserPreferences } from '@/services/settingsService';
import type { UserPreferences } from '@/types/advanced';

const loading = ref(false);
const saving = ref(false);

const form = reactive<UserPreferences>({
  theme: 'light',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  notifications: {
    email: true,
    browser: true,
    dailyDigest: false,
  },
  defaultView: 'list',
});

async function loadSettings() {
  loading.value = true;
  try {
    const prefs = await getUserPreferences();
    if (prefs) {
      Object.assign(form, prefs);
    }
  } catch (error) {
    ElMessage.error('加载设置失败');
  } finally {
    loading.value = false;
  }
}

async function submit() {
  saving.value = true;
  try {
    await updateUserPreferences(form);
    ElMessage.success('设置已保存');
    // 这里可以触发一个全局事件或 store action 来应用新设置（如切换主题）
  } catch (error) {
    ElMessage.error('保存设置失败');
  } finally {
    saving.value = false;
  }
}

function reset() {
  loadSettings();
}

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.settings-page {
  padding: 20px;
}
.header {
  margin-bottom: 20px;
}
</style>
