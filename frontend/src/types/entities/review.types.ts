import type { CommonResponse } from '../common/api.types';
import type { PageResponse } from './board.types'; // Backend returns Page<ReviewResponse>

/**
 * 리뷰 데이터 모델 (Domain Type)
 */
export interface ReviewData {
  reviewId: string;
  nickname: string;
  content: string;
  createdAt: string;
  isMyReview?: boolean;
}

/**
 * 리뷰 목록 조회 요청
 */
export interface GetReviewListRequest {
  boardId: string;
  page?: number;
  size?: number;
}

/**
 * 리뷰 생성 요청
 */
export interface CreateReviewRequest {
  boardId: string;
  content: string;
}

/**
 * 리뷰 수정 요청
 */
export interface UpdateReviewRequest {
  reviewId: string;
  content: string;
}

export type GetReviewListResponse = CommonResponse<PageResponse<ReviewData>>;
export type CreateReviewResponse = CommonResponse<{ reviewId: string }>;
export type UpdateReviewResponse = CommonResponse<{ reviewId: string }>;
export type DeleteReviewResponse = CommonResponse<void>;
