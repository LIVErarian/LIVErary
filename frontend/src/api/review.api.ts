import { api } from './axios';

import type {
  CreateReviewRequest,
  CreateReviewResponse,
  DeleteReviewResponse,
  GetReviewListRequest,
  GetReviewListResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
} from '@/types/entities/review.types';

/**
 * 리뷰(댓글) 관련 API 통신 모듈
 * Backend Controller: ReviewController (/api/review)
 */
export const reviewApi = {
  /**
   * 게시글의 리뷰 목록을 조회합니다.
   * EndPoint: GET /api/review/{boardId}
   * @param params boardId, page, size
   * @returns 리뷰 페이지 데이터
   */
  getReviewList: async ({
    boardId,
    page = 0,
    size = 10,
  }: GetReviewListRequest): Promise<GetReviewListResponse['data']> => {
    const { data } = await api.get<GetReviewListResponse>(
      `/review/${boardId}`,
      {
        params: { page, size },
      },
    );
    return data.data;
  },

  /**
   * 새로운 리뷰를 작성합니다.
   * EndPoint: POST /api/review/{boardId}/reviews
   * @param req boardId, content
   * @returns 생성된 리뷰 ID
   */
  createReview: async (
    req: CreateReviewRequest,
  ): Promise<CreateReviewResponse['data']> => {
    const { data } = await api.post<CreateReviewResponse>(
      `/review/${req.boardId}/reviews`,
      {
        content: req.content,
      },
    );
    return data.data;
  },

  /**
   * 기존 리뷰를 수정합니다.
   * EndPoint: PATCH /api/review/{reviewId}
   * @param req reviewId, content
   * @returns 수정된 리뷰 ID
   */
  updateReview: async ({
    reviewId,
    content,
  }: UpdateReviewRequest): Promise<UpdateReviewResponse['data']> => {
    const { data } = await api.patch<UpdateReviewResponse>(
      `/review/${reviewId}`,
      {
        content,
      },
    );
    return data.data;
  },

  /**
   * 리뷰를 삭제합니다.
   * EndPoint: DELETE /api/review/{reviewId}
   * @param reviewId 삭제할 리뷰 ID
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete<DeleteReviewResponse>(`/review/${reviewId}`);
  },
};
