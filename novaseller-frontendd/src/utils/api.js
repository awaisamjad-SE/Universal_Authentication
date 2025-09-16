import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to get access token
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// Helper to set tokens
export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem('accessToken', access);
  if (refresh) localStorage.setItem('refreshToken', refresh);
}

// Helper to clear tokens
export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Auth APIs
export const register = (data) => api.post('/register/', data);
export const sendOtp = (data) => api.post('/send-otp/', data);
export const verifyOtp = (data) => api.post('/verify-otp/', data);
export const login = (data) => api.post('/login/', data);
export const twoFALogin = (data) => api.post('/2fa/login/', data);
export const passwordReset = (data) => api.post('/password-reset/', data);
export const passwordResetConfirm = (data) => api.post('/password-reset-confirm/', data);
export const getProfile = () => api.get('/profile/');
export const updateProfile = (data) => api.put('/profile/', data);
export const setup2FA = () => api.post('/2fa/setup/');
export const verify2FA = (data) => api.post('/2fa/verify/', data);

// Token refresh (if your backend supports it at /api/token/refresh/)
export const refreshToken = (refresh) =>
  axios.post(API_BASE + '/api/token/refresh/', { refresh });

export default api;
