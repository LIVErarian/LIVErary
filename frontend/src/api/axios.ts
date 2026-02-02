import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/store/useAuthStore';

import type { ReissueResponse } from '@/types/auth.types';

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
    return response;
  },

  // 에러 처리
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // originalRequest가 없거나 이미 재시도했으면 에러 던지기
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 토큰 만료시
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        // refresh Token으로 새로운 accessToken 요청
        const storedRefreshToken = useAuthStore.getState().refreshToken;

        if (!storedRefreshToken) {
          throw new Error('사용할 수 있는 refresh token이 존재하지 않습니다.');
        }

        // AccessToken 재발급 요청 (지정해둔 api로 요청보내면 헤더가 붙어서 가므로 오류 발생 가능)
        const { data } = await axios.post<ReissueResponse>(
          `${BASE_URL}/auth/reissue`,
          { refreshToken: storedRefreshToken },
        );

        const newAccessToken = data.data?.accessToken;
        if (!newAccessToken) {
          throw new Error('새로운 access token이 존재하지 않습니다.');
        }
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 토큰 교체해서 다시 요청
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
