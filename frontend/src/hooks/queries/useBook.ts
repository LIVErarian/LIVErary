import { useQuery } from '@tanstack/react-query';

import { searchBook } from '@/api/book.api';

import type { BookSearchResponse } from '@/types/book.types';

export const useSearchBook = (
  keyword: string,
  page: number = 0,
  size: number = 20,
) => {
  return useQuery<BookSearchResponse>({
    queryKey: ['books', 'search', keyword, page, size],
    queryFn: () => searchBook(keyword, page, size),
    enabled: !!keyword, // 검색어가 있을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};
