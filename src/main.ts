import 'element-plus/theme-chalk/dark/css-vars.css';
import './styles/element-plus-overrides.css';
// 全局样式
import './styles/index.css';
import './assets/responsive.css';

import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { createPinia } from 'pinia';
import { createApp, watch } from 'vue';

import { connect as connectSocket, disconnect as disconnectSocket } from '@/services/websocket';
import { useUserStore } from '@/store/user';

import App from './App.vue';
import router from './router';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(ElementPlus, { locale: zhCn });
app.mount('#app');

// 根据用户登录状态自动管理 WebSocket
const userStore = useUserStore();
watch(
  () => userStore.token,
  (token: string | null) => {
    if (token) connectSocket();
    else disconnectSocket();
  },
  { immediate: true }
);
