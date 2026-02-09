import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reviewApi } from '@/api/review.api';

import type { GetReviewListRequest } from '@/types/review.types';

export const REVIEW_KEYS = {
  all: ['reviews'] as const,
  list: (boardId: string) => [...REVIEW_KEYS.all, 'list', boardId] as const,
  listPage: (boardId: string, page: number, size: number) =>
    [...REVIEW_KEYS.list(boardId), { page, size }] as const,
};

/**
 * 리뷰 목록을 조회하는 Query Hook입니다.
 */
export const useGetReviewList = (params: GetReviewListRequest) => {
  return useQuery({
    queryKey: [...REVIEW_KEYS.list(params.boardId), params], // params 전체를 키에 포함
    queryFn: () => reviewApi.getReviewList(params),
    enabled: !!params.boardId,
  });
};

/**
 * 리뷰 생성을 처리하는 Mutation Hook입니다.
 */
export const useCreateReview = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewApi.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.list(boardId) });
    },
  });
};

/**
 * 리뷰 수정을 처리하는 Mutation Hook입니다.
 */
export const useUpdateReview = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewApi.updateReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.list(boardId) });
    },
  });
};

/**
 * 리뷰 삭제를 처리하는 Mutation Hook입니다.
 */
export const useDeleteReview = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.list(boardId) });
    },
  });
};
