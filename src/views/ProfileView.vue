<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h2 class="text-2xl mb-4">个人资料</h2>
    <el-card>
      <el-form
        :model="form"
        :rules="rules"
        label-position="top"
        ref="formRef"
      >
        <div class="flex items-center space-x-6 mb-6">
          <img
            :src="avatarPreview || form.avatar || defaultAvatar"
            class="w-24 h-24 rounded-full object-cover"
          />
          <el-upload
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="onUploadSuccess"
            :action="uploadUrl"
            :http-request="httpUpload"
          >
            <el-button size="small">上传头像</el-button>
          </el-upload>
        </div>

        <el-form-item label="昵称">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input
            v-model="form.email"
            disabled
          />
        </el-form-item>

        <el-form-item label="简介">
          <el-input
            type="textarea"
            v-model="form.bio"
          />
        </el-form-item>

        <div class="mt-4 text-right">
          <el-button
            type="primary"
            @click="onSave"
            :loading="saving"
            >保存</el-button
          >
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

import { getProfile, uploadAvatar } from '@/services/userService';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const formRef = ref<FormInstance>();
const saving = ref(false);
const defaultAvatar = '/default-avatar.png';
const avatarPreview = ref<string | null>(null);

const form = reactive({
  name: userStore.currentUser?.name || '',
  email: userStore.currentUser?.email || '',
  bio: userStore.currentUser?.bio || '',
  avatar: userStore.currentUser?.avatar || '',
});

const uploadUrl = '/'; // not used because we use httpUpload

const rules: FormRules = {
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, message: '昵称至少 2 个字符', trigger: 'blur' },
  ],
};

onMounted(async () => {
  if (!userStore.currentUser) {
    try {
      const me = await getProfile();
      userStore.setCurrentUser(me as any);
      form.name = me.name || '';
      form.email = me.email || '';
      form.bio = me.bio || '';
      form.avatar = me.avatar || '';
    } catch (e) {
      // ignore
    }
  }
});

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件');
    return false;
  }
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 2MB');
    return false;
  }
  const reader = new FileReader();
  reader.onload = (e) => (avatarPreview.value = e.target?.result as string);
  reader.readAsDataURL(file);
  return true;
}

async function httpUpload({ file }: { file: File }) {
  try {
    const res = await uploadAvatar(file);
    const url = res.url || res.avatar || '';
    if (url) {
      form.avatar = url;
      avatarPreview.value = url;
      ElMessage.success('头像上传成功，记得点击保存以持久化');
    } else {
      ElMessage.warning('上传成功，但未返回头像 URL');
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '上传失败');
  }
}

function onUploadSuccess() {
  // handled in httpUpload
}

async function onSave() {
  saving.value = true;
  try {
    if (formRef.value) await formRef.value.validate();
    const updated = await userStore.updateProfile({
      name: form.name,
      bio: form.bio,
      avatar: form.avatar,
    });
    ElMessage.success('保存成功');
    userStore.setCurrentUser(updated as any);
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.object-cover {
  object-fit: cover;
}
</style>
