import type { CommonResponse } from './api.types';

export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  userId: string; // back에서 지정하는 uuid
  email: string;
  nickname: string;
  role: UserRole;
  preferences: string[] | null;
  totalReadingTime: number; // 분 단위
  bookCounts: {
    wish: number;
    reading: number;
    completed: number;
  };
}

// ======================= API =======================
export type getUserResponse = CommonResponse<UserProfile>;

// POST /api/user/preferences 요청 바디
export interface UserPreferencesRequest {
  categoryIds: string[];
}

// 공통 응답 포맷(status/code/message/data)을 그대로 사용
export type UserPreferencesResponse = CommonResponse<null>;
