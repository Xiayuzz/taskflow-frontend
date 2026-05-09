<template>
  <div
    v-if="visible"
    class="toast-container"
    :class="[typeClass, positionClass]"
  >
    <div class="toast-content">
      <i
        v-if="type !== 'info'"
        class="toast-icon"
        :class="iconClass"
      ></i>
      <span class="toast-message">{{ message }}</span>
      <i
        v-if="showClose"
        class="toast-close"
        @click="close"
        >×</i
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showClose?: boolean;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  showClose: true,
  position: 'top-right',
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

const timer = ref<number | null>(null);

const typeClass = ref(`toast-${props.type}`);
const positionClass = ref(`toast-${props.position}`);
const iconClass = ref(`toast-icon-${props.type}`);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      startTimer();
    } else {
      clearTimer();
    }
  }
);

watch(
  () => props.type,
  (newType) => {
    typeClass.value = `toast-${newType}`;
    iconClass.value = `toast-icon-${newType}`;
  }
);

watch(
  () => props.position,
  (newPosition) => {
    positionClass.value = `toast-${newPosition}`;
  }
);

function startTimer() {
  clearTimer();
  if (props.duration > 0) {
    timer.value = window.setTimeout(() => {
      close();
    }, props.duration);
  }
}

function clearTimer() {
  if (timer.value) {
    clearTimeout(timer.value);
    timer.value = null;
  }
}

function close() {
  clearTimer();
  emit('update:visible', false);
  emit('close');
}

onMounted(() => {
  if (props.visible) {
    startTimer();
  }
});

onUnmounted(() => {
  clearTimer();
});
</script>

<style>
.toast-container {
  position: fixed;
  z-index: 999999;
  max-width: 360px;
  min-width: 280px;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}

.toast-message {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  font-weight: 500;
}

.toast-close {
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.toast-close:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* 位置类 */
.toast-top-right {
  top: 24px;
  right: 24px;
}

.toast-top-center {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-bottom-right {
  bottom: 24px;
  right: 24px;
}

.toast-bottom-center {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
}

/* 类型类 - 使用项目主题色 */
.toast-success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.15);
}

.toast-error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.15);
}

.toast-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.15);
}

.toast-info {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #e9e9eb;
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.15);
}

/* 调整图标样式适配新主题 */
.toast-icon {
  background-color: transparent;
  width: auto;
  height: auto;
  border-radius: 0;
  margin-right: 4px;
}

/* 调整关闭按钮样式适配新主题 */
.toast-close {
  color: currentColor;
  opacity: 0.6;
  background-color: transparent;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  opacity: 1;
}

/* 图标类 - 使用 SVG 或 字符 */
.toast-icon-success::before {
  content: '✓';
  color: #67c23a;
  font-size: 16px;
}

.toast-icon-error::before {
  content: '✕';
  color: #f56c6c;
  font-size: 16px;
}

.toast-icon-warning::before {
  content: '!';
  color: #e6a23c;
  font-size: 16px;
}

/* 动画效果 */
.toast-container {
  animation: toast-fade-in 0.3s ease-out;
}

.toast-container.fade-out {
  animation: toast-fade-out 0.3s ease-in;
}

@keyframes toast-fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-fade-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toast-container {
    max-width: 90%;
    min-width: 240px;
    padding: 14px 18px;
  }

  .toast-top-right,
  .toast-top-center,
  .toast-bottom-right,
  .toast-bottom-center {
    left: 50%;
    transform: translateX(-50%);
    right: auto;
  }

  .toast-top-right,
  .toast-top-center {
    top: 16px;
  }

  .toast-bottom-right,
  .toast-bottom-center {
    bottom: 16px;
  }

  .toast-message {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .toast-container {
    max-width: 95%;
    min-width: 220px;
    padding: 12px 16px;
  }

  .toast-message {
    font-size: 13px;
  }
}
</style>
