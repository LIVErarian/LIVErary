import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';

import type { LoginRequest, LoginResponseData } from '@/types/auth.types';

export const useAuth = () => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    // 실행할 API 함수
    mutationFn: (req: LoginRequest) => authApi.login(req),

    onSuccess: (data: LoginResponseData) => {
      setTokens(data.accessToken, data.refreshToken);
      navigate('/', { replace: true }); // 뒤로가기 방지
      console.log('로그인 성공');
    },

    onError: (error: AxiosError) => {
      console.error('로그인 실패:', error.message);
    },
  });
};
