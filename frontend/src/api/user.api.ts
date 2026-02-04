import { api } from './axios';

import type {
  getUserResponse,
  OtherProfile,
  OtherProfileResponse,
  UserPreferencesRequest,
  UserPreferencesResponse,
  UserProfile,
  UserUpdateRequest,
} from '@/types/user.types';

export const userApi = {
  /**
   * 유저 정보 조회
   * @returns userId, email, nickname, role, totalReadingTime, bookCounts
   */
  getMyProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<getUserResponse>('/user');

    if (!data.data) {
      throw new Error('사용자 정보가 존재하지 않습니다.');
    }

    return data.data;
  },

  /**
   * 타인 프로필 조회
   * @param userId - 조회할 사용자 ID
   * @returns 타인 프로필 정보 (관계 상태 포함)
   */
  getOtherProfile: async (userId: string): Promise<OtherProfile> => {
    const { data } = await api.get<OtherProfileResponse>(
      `/user/${userId}/profile`,
    );

    if (!data.data) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    return data.data;
  },

  /**
   * 유저 선호 카테고리 저장
   * 최초 온보딩 모달에서 선택한 categoryIds를 서버에 전달한다.
   * @param req categoryIds
   */
  savePreferences: async (req: UserPreferencesRequest): Promise<void> => {
    await api.post<UserPreferencesResponse>('/user/preferences', req);
  },

  /**
   * 회원 정보 수정 (현재는 닉네임만)
   * @param req UserUpdateRequest
   */
  updateProfile: async (req: UserUpdateRequest): Promise<void> => {
    await api.patch('/user', req);
  },
};
