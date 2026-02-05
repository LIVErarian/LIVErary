import { useState } from 'react';

import { useGetReviewList } from '@/hooks/queries/useReview';
import { useAuthStore } from '@/store/useAuthStore';
import { ReviewForm } from './ReviewForm';
import { ReviewItem } from './ReviewItem';

import type { BoardType } from '@/types/board.types';

import * as styles from './Review.css';

interface ReviewListProps {
  boardId: string;
  boardType: BoardType;
}

/**
 * 리뷰 목록을 표시하고 페이징을 관리하는 컨테이너 컴포넌트입니다.
 */
export const ReviewList = ({ boardId, boardType }: ReviewListProps) => {
  const [page, setPage] = useState(0);
  const { user } = useAuthStore();
  const { data: reviewData, isLoading } = useGetReviewList({
    boardId,
    page,
    size: 5,
  }); // 한 페이지당 5개

  if (isLoading) return <div>리뷰 로딩 중...</div>;

  const totalPages = reviewData?.totalPages || 0;
  const currentPage = reviewData?.number || 0;

  // 문의 게시판(INQUIRY)은 관리자(ADMIN)만 댓글 작성 가능
  const canWriteReview =
    !!user && (user.role === 'ADMIN' || boardType !== 'INQUIRY');

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        💬 리뷰 ({reviewData?.totalElements || 0})
      </h3>

      <div className={styles.list}>
        {reviewData?.content.map((review) => (
          <ReviewItem key={review.reviewId} review={review} boardId={boardId} />
        ))}
        {reviewData?.content.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', padding: '1rem' }}>
            작성된 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
          </p>
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 0 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={reviewData?.first}
          >
            &lt;
          </button>

          {/* 간단한 페이지 표시 (현재 페이지 / 전체) */}
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            {currentPage + 1} / {totalPages}
          </span>

          <button
            className={styles.pageButton}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={reviewData?.last}
          >
            &gt;
          </button>
        </div>
      )}

      {canWriteReview && <ReviewForm boardId={boardId} />}
    </div>
  );
};
