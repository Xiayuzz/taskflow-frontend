import { defineStore } from 'pinia';

import { updateProfile as apiUpdateProfile } from '@/services/userService';
import { connect as wsConnect, disconnect as wsDisconnect } from '@/services/websocket';
import type { User } from '@/types/models';

interface State {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    currentUser: (() => {
      try {
        const raw = localStorage.getItem('user');
        return raw ? (JSON.parse(raw) as User) : null;
      } catch {
        return null;
      }
    })(),
    token: localStorage.getItem('token'),
    loading: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    isAdmin: (s) => s.currentUser?.role === 'admin',
  },
  actions: {
    setToken(token: string | null) {
      this.token = token;
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    },
    setCurrentUser(user: User | null) {
      this.currentUser = user;
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    },
    logout() {
      this.token = null;
      this.currentUser = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      try {
        wsDisconnect();
      } catch {
        /* ignore */
      }
    },
    async login(payload: { username: string; password: string; captchaId: string; captchaCode: string }) {
      const { login } = await import('@/services/authService');
      const res = await login(payload);
      this.setToken(res.token);
      this.setCurrentUser(res.user);
      try {
        wsConnect(this.token || undefined);
      } catch {
        /* ignore */
      }
      return res;
    },
    async updateProfile(payload: Partial<User>) {
      const updated = await apiUpdateProfile(payload);
      this.setCurrentUser(updated);
      return updated;
    },
  },
});
