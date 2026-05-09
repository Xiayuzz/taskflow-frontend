<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">编辑群组</h1>
      <router-link
        :to="`/groups/${groupId}`"
        class="inline-flex items-center justify-center h-10 px-5 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md bg-gray-600 hover:bg-gray-700 focus:shadow-outline focus:outline-none"
      >
        返回详情
      </router-link>
    </div>

    <el-form
      v-loading="loading"
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
      class="max-w-2xl"
    >
      <el-form-item
        label="群组名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          placeholder="请输入群组名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item
        label="群组描述"
        prop="description"
      >
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="请输入群组描述"
          :rows="4"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
        >
          保存
        </el-button>
        <el-button
          @click="resetForm"
          class="ml-2"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getGroupById, updateGroup } from '@/services/groupService';
import type { UpdateGroupForm } from '@/types/models';

const route = useRoute();
const groupId = computed(() => Number(route.params.id));

const loading = ref(true);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const form = ref<UpdateGroupForm>({
  name: '',
  description: '',
});

const rules = {
  name: [
    { required: true, message: '请输入群组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入群组描述', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' },
  ],
};

async function loadGroup() {
  loading.value = true;
  try {
    const data = await getGroupById(groupId.value);
    form.value = {
      name: data.name,
      description: data.description,
    };
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '加载群组信息失败');
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitting.value = true;
    await updateGroup(groupId.value, form.value);
    ElMessage.success('群组更新成功');
    // 跳转到群组详情
    setTimeout(() => {
      window.location.href = `/groups/${groupId.value}`;
    }, 1000);
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '更新群组失败');
    }
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  formRef.value?.resetFields();
}

onMounted(() => {
  loadGroup();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.el-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
