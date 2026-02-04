import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getBookDetail, searchBook, toggleWishlist } from '@/api/book.api';

import type {
  BookDetail,
  BookSearchResponse,
  WishStatusResponse,
} from '@/types/book.types';

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

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation<WishStatusResponse, Error, string>({
    mutationFn: (isbn) => {
      console.log('📍 [useToggleWishlist] Mutation started for ISBN:', isbn);
      return toggleWishlist(isbn);
    },
    onSuccess: (data, isbn) => {
      console.log('✅ [useToggleWishlist] Mutation succeeded for ISBN:', isbn);

      // 1. 검색 결과 캐시 업데이트
      const queryCache = queryClient.getQueryCache();
      const searchQueries = queryCache.findAll({
        queryKey: ['books', 'search'],
      });

      searchQueries.forEach((query) => {
        const currentData = query.state.data as BookSearchResponse | undefined;
        if (currentData) {
          queryClient.setQueryData(query.queryKey, {
            ...currentData,
            content: currentData.content.map((book) =>
              book.isbn === isbn ? { ...book, isWished: data.wished } : book,
            ),
          });
        }
      });

      // 2. 상세 정보 캐시 업데이트
      queryClient.setQueryData<BookDetail>(['books', 'detail', isbn], (old) => {
        if (!old) return undefined;
        return { ...old, isWished: data.wished };
      });

      // 3. 나의 서재(찜 목록) 캐시 무효화 -> 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['bookshelf', 'wished'] });
    },
    onError: (error, isbn) => {
      console.error('[useToggleWishlist] Mutation failed for ISBN:', isbn);
      console.error('[useToggleWishlist] Error:', error);
    },
  });
};

export const useBookDetail = (isbn: string, enabled: boolean = true) => {
  return useQuery<BookDetail>({
    queryKey: ['books', 'detail', isbn],
    queryFn: () => getBookDetail(isbn),
    enabled: enabled && !!isbn, // ISBN이 있고 enabled일 때만 실행
    staleTime: 1000 * 60 * 10, // 10분간 캐시 유지
  });
};
