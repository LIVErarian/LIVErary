import { api } from './axios';

import type {
  getUserResponse,
  OtherProfile,
  OtherProfileResponse,
  UserProfile,
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
};
