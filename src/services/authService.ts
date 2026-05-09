import api from './api';

export interface LoginPayload {
  username: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  captchaId: string;
  captchaCode: string;
}

export interface LoginResult {
  token: string;
  user: any;
}

export interface CaptchaResult {
  captchaId: string;
  image: string;
}

export async function getCaptcha(): Promise<CaptchaResult> {
  const res = await api.get('/auth/captcha');
  return res.data as CaptchaResult;
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const res = await api.post('/auth/login', payload);
  return res.data as LoginResult;
}

export async function register(payload: RegisterPayload) {
  const res = await api.post('/auth/register', payload);
  return res.data;
}

export async function me() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function logout() {
  const res = await api.post('/auth/logout');
  return res.data;
}

export async function requestPasswordReset(email: string) {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}
