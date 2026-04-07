import { api } from './axios';

import type {
  EmailCodeVerifyRequest,
  EmailCodeVerifyResponse,
  EmailVerifyRequest,
  EmailVerifyResponse,
  FindPasswordRequest,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  LogoutResponse,
  ResetPasswordRequest,
  SignupRequest,
  SignupResponse,
} from '@/types/entities/auth.types';

export const authApi = {
  /**
   * 로그인 API
   * @param req 이메일, 비밀번호
   * @returns AccessToken, RefreshToken
   */
  login: async (req: LoginRequest): Promise<LoginResponseData> => {
    const { data } = await api.post<LoginResponse>('/auth/login', req);

    if (!data.data) {
      throw new Error('데이터가 존재하지 않습니다.');
    }

    return data.data;
  },

  /**
   * 로그아웃 API
   */
  logout: async (): Promise<void> => {
    await api.post<LogoutResponse>('/auth/logout');
  },

  /**
   * 회원가입 API
   * @param req 이메일, 닉네임, 비밀번호
   */
  signup: async (req: SignupRequest): Promise<void> => {
    await api.post<SignupResponse>('/auth/signup', req);
  },

  /**
   * 이메일 확인 API (이메일로 코드 전송)
   * @param req 이메일
   */
  requestEmailVerify: async (req: EmailVerifyRequest): Promise<void> => {
    await api.post<EmailVerifyResponse>(
      '/auth/email/verification/request',
      req,
    );
  },

  /**
   * 이메일 코드 확인 API (이메일로 전송된 코드가 맞는지 확인)
   * @param req 이메일, 코드
   */
  verifyEmailCode: async (req: EmailCodeVerifyRequest): Promise<void> => {
    await api.post<EmailCodeVerifyResponse>(
      '/auth/email/verification/confirm',
      req,
    );
  },

  /**
   * 비밀번호 찾기 (이메일로 임시 비밀번호 전송)
   */
  findPassword: async (req: FindPasswordRequest): Promise<void> => {
    await api.post('/auth/password/find', req);
  },

  /**
   * 비밀번호 재설정 (로그인 후 변경)
   */
  resetPassword: async (req: ResetPasswordRequest): Promise<void> => {
    await api.patch('/auth/password/reset', req);
  },
};
