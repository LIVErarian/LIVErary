import type { CommonResponse } from '../common/api.types';
import type { FriendRelationStatus } from './friend.types';

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

// 타인 프로필 응답 데이터
export interface OtherProfile {
  userId: string;
  email: string;
  nickname: string;
  role: UserRole;
  preferences: string[] | null; // 선호 카테고리 추가
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

// POST /api/user/preferences 요청 바디
export interface UserPreferencesRequest {
  categoryIds: string[];
}

// 회원 정보 수정 요청 바디 (확장 가능)
export interface UserUpdateRequest {
  nickname: string;
}

// 공통 응답 포맷(status/code/message/data)을 그대로 사용
export type UserPreferencesResponse = CommonResponse<null>;
