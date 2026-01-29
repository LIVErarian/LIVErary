import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';

import type {
  EmailCodeVerifyRequest,
  EmailCodeVerifyResponse,
  EmailVerifyRequest,
  EmailVerifyResponse,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  SignupRequest,
  SignupResponse,
} from '@/types/auth.types';

export const useLogin = () => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation<
    LoginResponseData,
    AxiosError<LoginResponse>,
    LoginRequest
  >({
    // 실행할 API 함수
    mutationFn: (req: LoginRequest) => authApi.login(req),

    onSuccess: (data: LoginResponseData) => {
      setTokens(data.accessToken, data.refreshToken);
      console.log('로그인 성공');

      navigate('/game', { replace: true }); // 뒤로가기 방지
    },

    onError: (error: AxiosError) => {
      console.error('로그인 실패:', error.message);
    },
  });
};

export const useSignup = () => {
  const navigate = useNavigate();
  return useMutation<void, AxiosError<SignupResponse>, SignupRequest>({
    mutationFn: (req: SignupRequest) => authApi.signup(req),

    onSuccess: () => {
      console.log('회원가입 성공');
      navigate('/login', { replace: true });
    },

    onError: (error: AxiosError) => {
      console.error('회원가입 실패:', error.message);
    },
  });
};

export const useCheckEmail = () => {
  // <성공 시 반환 값, 실패 시 에러 타입, 요청 시 보내는 데이터 타입>
  return useMutation<void, AxiosError<EmailVerifyResponse>, EmailVerifyRequest>(
    {
      mutationFn: (req: EmailVerifyRequest) => authApi.requestEmailVerify(req),
    },
  );
};

export const useVerifyEmail = () => {
  return useMutation<
    void,
    AxiosError<EmailCodeVerifyResponse>,
    EmailCodeVerifyRequest
  >({
    mutationFn: (req: EmailCodeVerifyRequest) => authApi.verifyEmailCode(req),
  });
};
