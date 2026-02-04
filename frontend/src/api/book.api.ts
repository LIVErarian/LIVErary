import { api } from './axios';

import type { CommonResponse } from '@/types/api.types';
import type {
  BookDetail,
  BookSearchResponse,
  WishStatusResponse,
} from '@/types/book.types';

// 책 검색
export const searchBook = async (
  keyword: string,
  page: number = 0,
  size: number = 20,
): Promise<BookSearchResponse> => {
  const { data } = await api.get<CommonResponse<BookSearchResponse>>(
    `/book/search`,
    {
      params: { keyword, page, size },
    },
  );

  if (!data.data) {
    throw new Error('데이터가 존재하지 않습니다.');
  }

  return data.data;
};

// 책 찜 토글
export const toggleWishlist = async (
  isbn: string,
): Promise<WishStatusResponse> => {
  try {
    const { data } = await api.post<CommonResponse<WishStatusResponse>>(
      `/book-history/wish/toggle/${isbn}`,
    );

    if (!data.data) {
      throw new Error('Failed to toggle wishlist');
    }

    return data.data;
  } catch (error) {
    console.error('Failed to toggle book wish', error);
    throw error;
  }
};

// 책 상세조회
export const getBookDetail = async (isbn: string): Promise<BookDetail> => {
  try {
    const { data } = await api.get<CommonResponse<BookDetail>>(`/book/${isbn}`);

    if (!data.data) {
      throw new Error('Failed to fetch book detail');
    }

    return data.data;
  } catch (error) {
    throw new Error('Failed to fetch book detail');
    throw error;
  }
};
