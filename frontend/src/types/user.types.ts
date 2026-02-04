import type { CommonResponse } from './api.types';
import type { FriendRelationStatus } from './friend.types';

export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  userId: string; // back에서 지정하는 uuid
  email: string;
  nickname: string;
  role: UserRole;
  totalReadingTime: number; // 분 단위
  bookCounts: {
    wish: number;
    reading: number;
    completed: number;
  };
}

// 타인 프로필 응답 데이터
export interface OtherProfile {
  userId: string;
  email: string;
  nickname: string;
  role: UserRole;
  totalReadingTime: number;
  bookCounts: {
    wish: number;
    reading: number;
    completed: number;
  };
  relationStatus: FriendRelationStatus; // 관계 상태
}

// ======================= API =======================
export type getUserResponse = CommonResponse<UserProfile>;
export type OtherProfileResponse = CommonResponse<OtherProfile>;
