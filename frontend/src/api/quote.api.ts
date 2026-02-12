import { api } from './axios';

import type { CommonResponse } from '@/types/common/api.types';

export interface QuoteResponse {
  id: number;
  content: string;
  title: string;
  author: string;
  publisher: string;
}

export const quoteApi = {
  /**
   * 랜덤 명언 조회 API
   * @returns QuoteResponse (id, content, title, author, publisher)
   */
  getRandomQuote: async (): Promise<QuoteResponse> => {
    const { data } =
      await api.get<CommonResponse<QuoteResponse>>('/quote/random');

    if (!data.data) {
      throw new Error('명언을 불러올 수 없습니다.');
    }

    return data.data;
  },
};
