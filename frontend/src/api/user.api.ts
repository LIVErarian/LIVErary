import { api } from './axios';

import type {
  getUserResponse,
  UserPreferencesRequest,
  UserPreferencesResponse,
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
   * 유저 선호 카테고리 저장
   * 최초 온보딩 모달에서 선택한 categoryIds를 서버에 전달한다.
   * @param req categoryIds
   */
  savePreferences: async (req: UserPreferencesRequest): Promise<void> => {
    await api.post<UserPreferencesResponse>('/user/preferences', req);
  },
};
