import { api } from './axios';

import type { CommonResponse } from '@/types/api.types';
import type {
  UserBooksResponse,
  UserBookStatus,
} from '@/types/bookshelf.types';
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

  /**
   * 유저의 책 목록 조회 (찜, 읽고 있는, 읽은 책)
   * @param status 책 상태 (WISH, PENDING, COMPLETED)
   * @param page 페이지 번호 (0부터 시작)
   * @param size 페이지 크기
   */
  getUserBooks: async (
    status: UserBookStatus,
    page: number = 0,
    size: number = 6,
  ): Promise<UserBooksResponse> => {
    const { data } = await api.get<CommonResponse<UserBooksResponse>>(
      '/user/books',
      {
        params: {
          status,
          page,
          size,
        },
      },
    );

    if (!data.data) {
      throw new Error('데이터가 존재하지 않습니다.');
    }

    return data.data;
  },

  /**
   * 책장에 책 추가
   * @param isbn 책의 ISBN (또는 식별자)
   * @param status 책 상태 (READING | COMPLETED)
   */
  addBook: async (isbn: string, status: UserBookStatus) => {
    // [Backend Note]: 엔드포인트 URL과 Request Body 구조는 서버 API 명세를 확인하세요.
    // 보통 POST /api/user-books 또는 /api/bookshelves 같은 형태일 것입니다.
    const response = await api.post('/api/user/books', {
      isbn,
      status,
    });
    return response.data;
  },
};
