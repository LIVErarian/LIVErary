import type { CommonResponse } from './api.types';

// 유저 정보
export interface UserInfo {
  email: string;
  nickname: string;
}

// ======================= API =======================
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

// 최종 로그인 응답 타입
export type LoginResponse = CommonResponse<LoginResponseData>;

// 로그아웃 응답
export type LogoutResponse = CommonResponse<null>;

// 회원가입 요청
export interface SignupRequest extends LoginRequest {
  nickname: string;
}

// 회원가입 응답
export type SignupResponse = CommonResponse<null>;

// 이메일 인증 코드 요청
export interface EmailVerifyRequest {
  email: string;
}

// 이메일 인증 코드 응답
export type EmailVerifyResponse = CommonResponse<null>;

// 이메일 인증 코드 확인 요청
export interface EmailCodeVerifyRequest extends EmailVerifyRequest {
  code: string;
}

// 이메일 인증 코드 확인 응답
export type EmailCodeVerifyResponse = CommonResponse<null>;
