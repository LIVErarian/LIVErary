import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserProfile } from '@/types/user.types';

interface AuthState {
  // 상태
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: UserProfile | null;

  // 액션
  setAccessToken: (token: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,

      // 로그인 성공 시 토큰 저장
      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          user: null,
        }),
      setTokens: (access, refresh) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),
    }),
    // persist 설정
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
