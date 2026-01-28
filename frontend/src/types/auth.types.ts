import type { CommonResponse } from './api.types';

// 유저 정보
export interface UserInfo {
  email: string;
  nickname: string;
}

// ============== API 관련 =======================
// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

// 최종 응답 타입
export type LoginResponse = CommonResponse<LoginResponseData>;
