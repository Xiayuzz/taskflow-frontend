<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-800">注册</h1>
        <el-tag
          type="success"
          effect="plain"
          >新账号</el-tag
        >
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item
          label="用户名"
          prop="name"
        >
          <el-input
            v-model="form.name"
            placeholder="输入昵称"
            clearable
          />
        </el-form-item>
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
            placeholder="至少 6 位"
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="confirm"
        >
          <el-input
            v-model="form.confirm"
            type="password"
            show-password
            placeholder="再次输入"
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
        <el-button
          type="primary"
          class="w-full"
          size="large"
          :loading="loading"
          @click="onSubmit"
          >注册</el-button
        >
        <div class="mt-6 text-center text-sm text-gray-500">
          已有账号？
          <router-link
            to="/login"
            class="text-blue-600 hover:underline"
            >去登录</router-link
          >
        </div>
      </el-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

import { getCaptcha, register } from '@/services/authService';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirm: string;
  captchaCode: string;
}
const form = reactive<RegisterForm>({ name: '', email: '', password: '', confirm: '', captchaCode: '' });
const formRef = ref<FormInstance>();
const loading = ref(false);

const captchaId = ref('');
const captchaImage = ref('');

const rules: FormRules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '至少 6 位', trigger: 'blur' },
  ],
  confirm: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.password) callback(new Error('两次密码不一致'));
        else callback();
      },
      trigger: ['blur', 'change'],
    },
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

async function onSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        captchaId: captchaId.value,
        captchaCode: form.captchaCode,
      });
      ElMessage.success('注册成功，请登录');
      window.location.href = '/login';
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '注册失败');
      // 注册失败后自动刷新验证码
      form.captchaCode = '';
      await refreshCaptcha();
    } finally {
      loading.value = false;
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
