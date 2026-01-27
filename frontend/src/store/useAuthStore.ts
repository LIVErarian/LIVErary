import { create } from 'zustand';

import type { UserInfo } from '@/types/auth.types';

interface AuthState {
  // 상태
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: UserInfo | null;

  // 액션
  setAccessToken: (token: string) => void;
  setUser: (user: UserInfo) => void;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,

  // 로그인 성공 시 토큰 저장
  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  logout: () => set({ accessToken: null, isAuthenticated: false, user: null }),
  setTokens: (access, refresh) =>
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
}));
