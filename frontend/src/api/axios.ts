import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/store/useAuthStore';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // refresh Token 전송 허용
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  // 200인 경우 그냥 통과
  (response) => response,

  // 에러 처리
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // originalRequest가 없거나 이미 재시도했으면 에러 던지기
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        // refresh token 요청
        const { data } = await api.post('/auth/reissue');
        const refreshToken = data.refreshToken;
        useAuthStore.getState().setAccessToken(refreshToken);

        // 토큰 교체해서 다시 요청
        originalRequest.headers.Authorization = `Bearer ${refreshToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
