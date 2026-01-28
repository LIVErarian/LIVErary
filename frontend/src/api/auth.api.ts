import { api } from './axios';

import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
} from '@/types/auth.types';

export const authApi = {
  /**
   * 로그인 API
   * @param req 이메일, 비밀번호
   * @returns AccessToken, RefreshToken
   */
  login: async (req: LoginRequest): Promise<LoginResponseData> => {
    const { data } = await api.post<LoginResponse>('/auth/login', req);

    return data.data;
  },
};
