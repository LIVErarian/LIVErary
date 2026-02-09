import { useQuery } from '@tanstack/react-query';

import type { QuoteResponse } from '@/api/quote.api';
import { quoteApi } from '@/api/quote.api';

/**
 * 랜덤 명언 조회 Hook
 * @returns QuoteResponse (id, content, title, author, publisher)
 */
export const useQuote = () => {
  return useQuery<QuoteResponse>({
    queryKey: ['quote', 'random'],
    queryFn: quoteApi.getRandomQuote,
    gcTime: 0, // 매번 새로운 명언 조회
    staleTime: 0,
  });
};
