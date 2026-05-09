import axios from 'axios';

import { useUserStore } from '@/store/user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
  responseType: 'json', // 明确设置响应类型为JSON
});

api.interceptors.request.use((config) => {
  const userStore = useUserStore();
  if (userStore.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${userStore.token}`;
  }
  return config;
});

// 转换snake_case到camelCase的辅助函数
function toCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    // 手动解码可能存在乱码的字符串，特别是文件名
    if (typeof obj === 'string') {
      try {
        // 尝试检测并修复UTF-8编码的乱码
        return decodeURIComponent(escape(obj));
      } catch (e) {
        // 如果解码失败，返回原始字符串
        return obj;
      }
    }
    return obj;
  }
  // 特殊处理：如果是Blob、File等二进制类型，直接返回
  if (obj instanceof Blob || obj instanceof File) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item));
  }
  const camelCaseObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelCaseObj[camelCaseKey] = toCamelCase(obj[key]);
    }
  }
  return camelCaseObj;
}

import { toast } from './toast';

api.interceptors.response.use(
  (r) => {
    // 将响应数据转换为camelCase，同时修复中文编码
    r.data = toCamelCase(r.data);
    return r;
  },
  (err) => {
    // 调试日志：确认进入了响应拦截器
    console.log('进入响应拦截器，错误信息:', err);

    // 只有当用户已经登录时，才在401错误时调用logout
    const userStore = useUserStore();
    if (err.response?.status === 401 && userStore.token) {
      userStore.logout();
    }

    // 从错误响应中提取友好的错误信息
    let errorMessage = '操作失败，请稍后重试';

    // 特殊处理 403 权限不足错误
    if (err.response?.status === 403) {
      errorMessage = '您没有权限执行此操作，请联系管理员。本次访问已被记录。';
    } else if (err.response?.data) {
      console.log('响应数据:', err.response.data);
      if (typeof err.response.data === 'object') {
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
      } else if (typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    try {
      toast.error(errorMessage, {
        duration: 3000,
        showClose: true,
        position: 'top-right',
      });
    } catch (msgErr) {
      console.error('Failed to show error message:', msgErr);
      // 作为兜底方案，使用原生alert
      alert(errorMessage);
    }

    // 确保错误对象包含正确的错误信息，方便上层组件提取
    return Promise.reject(err);
  }
);

export default api;
