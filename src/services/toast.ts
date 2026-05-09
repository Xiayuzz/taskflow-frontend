import { createApp, h } from 'vue';

import Toast from '../components/Toast.vue';

interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showClose?: boolean;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

class ToastService {
  private toasts: Array<{
    id: number;
    app: any;
    container: HTMLElement;
  }> = [];
  private idCounter = 0;

  private createToast(options: ToastOptions) {
    const id = ++this.idCounter;
    const container = document.createElement('div');
    document.body.appendChild(container);

    const removeToast = this.removeToast.bind(this);

    const app = createApp({
      render() {
        return h(Toast, {
          visible: true,
          message: options.message,
          type: options.type,
          duration: options.duration,
          showClose: options.showClose,
          position: options.position,
          'onUpdate:visible': (value: boolean) => {
            if (!value) {
              removeToast(id);
            }
          },
          onClose: () => {
            removeToast(id);
          },
        });
      },
    });

    app.mount(container);
    this.toasts.push({ id, app, container });

    return id;
  }

  private removeToast(id: number) {
    const index = this.toasts.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      const { app, container } = this.toasts[index];
      app.unmount();
      document.body.removeChild(container);
      this.toasts.splice(index, 1);
    }
  }

  success(message: string, options?: Omit<ToastOptions, 'message' | 'type'>) {
    return this.createToast({
      message,
      type: 'success',
      ...options,
    });
  }

  error(message: string, options?: Omit<ToastOptions, 'message' | 'type'>) {
    return this.createToast({
      message,
      type: 'error',
      ...options,
    });
  }

  warning(message: string, options?: Omit<ToastOptions, 'message' | 'type'>) {
    return this.createToast({
      message,
      type: 'warning',
      ...options,
    });
  }

  info(message: string, options?: Omit<ToastOptions, 'message' | 'type'>) {
    return this.createToast({
      message,
      type: 'info',
      ...options,
    });
  }

  close(id: number) {
    this.removeToast(id);
  }

  closeAll() {
    this.toasts.forEach(({ id }) => {
      this.removeToast(id);
    });
  }
}

export const toast = new ToastService();
