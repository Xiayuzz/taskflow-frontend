import { io, Socket } from 'socket.io-client';

import { useTaskStore } from '@/store/task';
import type { Comment, Task } from '@/types/models';

let socket: Socket | null = null;

const WS_URL =
  import.meta.env.VITE_WS_URL || import.meta.env.VITE_WS_BASE || window.location.origin;
const WS_PATH = import.meta.env.VITE_WS_PATH || '/ws';

export function connect(token?: string) {
  if (socket) return socket;
  const opts: any = {
    path: WS_PATH,
    transports: ['websocket'],
  };
  if (token) {
    opts.auth = { token };
    opts.query = { token };
  }
  socket = io(WS_URL, opts);

  socket.on('connect', () => {
    console.info('[ws] connected', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.info('[ws] disconnected', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[ws] connect_error', err);
  });

  // app-specific handlers
  try {
    const taskStore = useTaskStore();
    socket.on('task:update', (task: Task) => taskStore.upsert(task));
    socket.on('task:new', (task: Task) => taskStore.upsert(task));
    socket.on('comment:new', (comment: Comment) => {
      // currently just log; later wire to comment store
      console.log('[ws] comment:new', comment);
    });
  } catch (err) {
    // ignore store wiring errors (e.g., during SSR or early init)
    console.debug('[ws] store wiring skipped', err);
  }

  return socket;
}

export function disconnect() {
  if (!socket) return;
  try {
    socket.disconnect();
  } finally {
    socket = null;
  }
}

export function on(event: string, cb: (...args: any[]) => void) {
  socket?.on(event, cb);
}

export function off(event: string, cb?: (...args: any[]) => void) {
  if (cb) socket?.off(event, cb);
  else socket?.off(event);
}

export function emit(event: string, ...args: any[]) {
  socket?.emit(event, ...args);
}

export default {
  connect,
  disconnect,
  on,
  off,
  emit,
};
