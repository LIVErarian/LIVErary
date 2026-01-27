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
  (response) => {
    return response; // TODO: 이중 포장 상태이므로 추후 response.data로 바꿀 것
  },

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
        // refresh Token으로 새로운 accessToken 요청
        const storedRefreshToken = useAuthStore.getState().refreshToken;

        if (!storedRefreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await api.post('/auth/reissue', {
          refreshToken: storedRefreshToken, // request body
        });

        const newAccessToken = data.data.refreshToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 토큰 교체해서 다시 요청
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
