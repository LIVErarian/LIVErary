import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getBookDetail,
  registerCompletedBook,
  registerReadingBook,
  searchBook,
  toggleWishlist,
} from '@/api/book.api';

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
  return useMutation<
    WishStatusResponse,
    Error,
    string,
    {
      previousSearchData: [QueryKey, unknown][];
      previousDetailData: BookDetail | undefined;
    }
  >({
    mutationFn: (isbn) => toggleWishlist(isbn),
    onMutate: async (isbn) => {
      // 1. 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['books', 'search'] });
      await queryClient.cancelQueries({ queryKey: ['books', 'detail', isbn] });

      // 2. 이전 데이터 스냅샷 저장
      const previousSearchData = queryClient.getQueriesData({
        queryKey: ['books', 'search'],
      });
      const previousDetailData = queryClient.getQueryData<BookDetail>([
        'books',
        'detail',
        isbn,
      ]);

      // 3. 캐시 낙관적 업데이트
      // (1) 검색/목록 결과 업데이트
      queryClient.setQueriesData<BookSearchResponse>(
        { queryKey: ['books', 'search'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            content: oldData.content.map((book) =>
              book.isbn === isbn ? { ...book, isWished: !book.isWished } : book,
            ),
          };
        },
      );

      // (2) 상세 정보 업데이트
      queryClient.setQueryData<BookDetail>(
        ['books', 'detail', isbn],
        (oldData) => {
          if (!oldData) return oldData;
          return { ...oldData, isWished: !oldData.isWished };
        },
      );

      // 4. 스냅샷 반환 (에러 시 복구용)
      return { previousSearchData, previousDetailData };
    },
    onError: (err, isbn, context) => {
      console.error('Optimistic update failed, rolling back.', err);
      // 에러 시 스냅샷으로 롤백
      if (context?.previousSearchData) {
        context.previousSearchData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetailData) {
        queryClient.setQueryData(
          ['books', 'detail', isbn],
          context.previousDetailData,
        );
      }
    },
    onSettled: (data, error, isbn) => {
      // 쿼리 무효화 (최신 데이터 갱신)
      queryClient.invalidateQueries({ queryKey: ['books', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'detail', isbn] });
      queryClient.invalidateQueries({ queryKey: ['books', 'detail', isbn] });
      queryClient.invalidateQueries({ queryKey: ['user', 'books', 'WISH'] });
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

export const useRegisterReadingBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isbn: string) => registerReadingBook(isbn),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'books', 'READING'],
      });
    },
  });
};

export const useRegisterCompletedBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isbn: string) => registerCompletedBook(isbn),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'books'],
      });
    },
  });
};
