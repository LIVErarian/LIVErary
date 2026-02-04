import { api } from './axios';

import type { CommonResponse } from '@/types/api.types';
import type { BookSearchResponse } from '@/types/book.types';

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
