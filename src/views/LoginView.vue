<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-800">登录</h1>
        <el-tag
          type="info"
          effect="plain"
          >TaskFlow</el-tag
        >
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="onSubmit"
      >
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input
            v-model="form.email"
            placeholder="you@example.com"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item
          label="验证码"
          prop="captchaCode"
        >
          <div class="flex gap-2">
            <el-input
              v-model="form.captchaCode"
              placeholder="请输入 4 位验证码"
              maxlength="4"
              class="flex-1"
              @keyup.enter="onSubmit"
            />
            <img
              v-if="captchaImage"
              :src="captchaImage"
              alt="点击刷新"
              class="h-10 cursor-pointer rounded border border-gray-200"
              style="width: 120px"
              @click="refreshCaptcha"
            />
          </div>
        </el-form-item>
        <div class="flex items-center justify-between mb-4 text-sm">
          <el-checkbox v-model="remember">记住我</el-checkbox>
          <a
            class="text-blue-600 hover:underline"
            href="#"
            @click.prevent="openForgotDialog"
            >忘记密码?</a
          >
        </div>

        <el-button
          type="primary"
          class="w-full"
          size="large"
          :loading="loading"
          @click="onSubmit"
          >登录</el-button
        >
        <div class="mt-6 text-center text-sm text-gray-500">
          还没有账号？
          <router-link
            to="/register"
            class="text-blue-600 hover:underline"
            >立即注册</router-link
          >
        </div>
      </el-form>
    </div>
    <el-dialog
      v-model="forgotVisible"
      title="重置密码"
      width="420px"
      :close-on-click-modal="false"
      @closed="handleForgotClosed"
    >
      <p class="mb-3 text-sm text-gray-500">输入注册邮箱，我们会发送重置密码的链接。</p>
      <el-form
        ref="forgotFormRef"
        :model="forgotForm"
        :rules="forgotRules"
        label-position="top"
      >
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input
            v-model="forgotForm.email"
            placeholder="you@example.com"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          @click="forgotVisible = false"
          :disabled="forgotLoading"
          >取消</el-button
        >
        <el-button
          type="primary"
          :loading="forgotLoading"
          @click="onForgotSubmit"
          >发送重置邮件</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getCaptcha, requestPasswordReset } from '@/services/authService';
import { useUserStore } from '@/store/user';

interface LoginForm {
  email: string;
  password: string;
  captchaCode: string;
}
const form = reactive<LoginForm>({ email: '', password: '', captchaCode: '' });
const formRef = ref<FormInstance>();
const remember = ref(false);
const loading = ref(false);
const forgotVisible = ref(false);
const forgotLoading = ref(false);
const forgotForm = reactive({ email: '' });
const forgotFormRef = ref<FormInstance>();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const captchaId = ref('');
const captchaImage = ref('');

// 如果已登录，访问 login 页面应立即跳转回 redirect 或默认的 /dashboard
if (userStore.isAuthenticated) {
  const raw = (route.query.redirect as string) || '/dashboard';
  try {
    if (raw.startsWith('/')) {
      router.replace(raw);
    } else {
      const u = new URL(raw, window.location.origin);
      if (u.origin === window.location.origin) router.replace(u.pathname + u.search + u.hash);
      else router.replace('/dashboard');
    }
  } catch {
    router.replace('/dashboard');
  }
}

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '至少 6 位', trigger: 'blur' },
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码为 4 位数字', trigger: 'blur' },
  ],
};

async function refreshCaptcha() {
  try {
    const data = await getCaptcha();
    captchaId.value = data.captchaId;
    captchaImage.value = data.image;
  } catch {
    // 错误已在拦截器中提示
  }
}

onMounted(refreshCaptcha);

const forgotRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] },
  ],
};

async function onSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      await userStore.login({
        username: form.email,
        password: form.password,
        captchaId: captchaId.value,
        captchaCode: form.captchaCode,
      });
      ElMessage.success('登录成功');
      const raw = (route.query.redirect as string) || '/dashboard';
      let target = '/dashboard';
      try {
        if (raw.startsWith('/')) {
          target = raw;
        } else {
          const u = new URL(raw, window.location.origin);
          if (u.origin === window.location.origin) target = u.pathname + u.search + u.hash;
        }
      } catch {
        // ignore malformed URL, fallback to dashboard
      }
      await router.replace(target);
    } catch (e: any) {
      console.error('Login error:', e);
      // 登录失败后自动刷新验证码
      form.captchaCode = '';
      await refreshCaptcha();
    } finally {
      loading.value = false;
    }
  });
}

function openForgotDialog() {
  forgotForm.email = form.email;
  forgotVisible.value = true;
}

function handleForgotClosed() {
  forgotFormRef.value?.resetFields();
  forgotLoading.value = false;
  forgotForm.email = '';
}

async function onForgotSubmit() {
  if (!forgotFormRef.value) return;
  await forgotFormRef.value.validate(async (valid) => {
    if (!valid) return;
    forgotLoading.value = true;
    try {
      await requestPasswordReset(forgotForm.email);
      ElMessage.success('重置邮件已发送，请检查邮箱');
      forgotVisible.value = false;
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '发送失败，请稍后重试');
    } finally {
      forgotLoading.value = false;
    }
  });
}
</script>
<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
</style>
