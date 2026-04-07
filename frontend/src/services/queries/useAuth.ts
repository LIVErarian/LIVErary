import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { authApi } from '@/api/auth.api';
import { userApi } from '@/api/user.api';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

import type {
  EmailCodeVerifyRequest,
  EmailCodeVerifyResponse,
  EmailVerifyRequest,
  EmailVerifyResponse,
  FindPasswordRequest,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  ResetPasswordRequest,
  SignupRequest,
  SignupResponse,
} from '@/types/entities/auth.types';

export const useLogin = () => {
  // Mocked login logic for testing purposes
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    LoginResponseData,
    AxiosError<LoginResponse>,
    LoginRequest
  >({
    // 실행할 API 함수
    mutationFn: (req: LoginRequest) => authApi.login(req),

    onSuccess: async (data: LoginResponseData) => {
      setTokens(data.accessToken, data.refreshToken);
      console.log('로그인 성공');

      try {
        const userProfile = await userApi.getMyProfile();

        setUser(userProfile);
        console.log('유저 정보 로드 완료:', userProfile);
        navigate('/', { replace: true }); // 뒤로가기 방지
      } catch (error) {
        console.error('유저 정보를 불러오기 실패:', error);
        navigate('/', { replace: true });
      }
    },

    onError: (error: AxiosError) => {
      console.error('로그인 실패:', error.message);
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const { openModal } = useModalStore();

  return useMutation({
    mutationFn: () => authApi.logout(),

    // 성공하든 실패하든 로그아웃은 시켜야하므로 onSettled 쓰기
    onSettled: () => {
      logout();

      // 캐싱된 유저 정보 있으면 제거
      queryClient.removeQueries({ queryKey: ['user'] });

      openModal('alert', { message: '로그아웃 되었습니다.' });
      navigate('/login', { replace: true });
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

export const useFindPassword = () => {
  return useMutation<void, AxiosError<void>, FindPasswordRequest>({
    mutationFn: (req: FindPasswordRequest) => authApi.findPassword(req),
  });
};

export const useResetPassword = () => {
  return useMutation<void, AxiosError<void>, ResetPasswordRequest>({
    mutationFn: (req: ResetPasswordRequest) => authApi.resetPassword(req),
  });
};
