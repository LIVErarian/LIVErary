import { useState } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

import { useDeleteReview, useUpdateReview } from '@/hooks/queries/useReview';

import type { ReviewData } from '@/types/review.types';

import * as styles from './Review.css';

interface ReviewItemProps {
  review: ReviewData;
  boardId: string;
}

/**
 * 개별 리뷰를 표시하고 수정/삭제 기능을 제공하는 컴포넌트입니다.
 */
export const ReviewItem = ({ review, boardId }: ReviewItemProps) => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);

  const { mutate: updateReview } = useUpdateReview(boardId);
  const { mutate: deleteReview } = useDeleteReview(boardId);

  const isMyReview = user?.nickname === review.nickname;

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    updateReview(
      { reviewId: review.reviewId, content: editContent },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    if (confirm('리뷰를 삭제하시겠습니까?')) {
      deleteReview(review.reviewId);
    }
  };

  return (
    <div className={styles.item}>
      <div className={styles.itemHeader}>
        <span className={styles.author}>{review.nickname}</span>
        <span className={styles.date}>{new Date(review.createdAt).toLocaleString()}</span>
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            className={styles.textarea}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className={styles.actionButtons}>
            <button onClick={() => setIsEditing(false)} className={styles.actionButton}>취소</button>
            <button onClick={handleUpdate} className={styles.actionButton}>저장</button>
          </div>
        </div>
      ) : (
        <p className={styles.content}>{review.content}</p>
      )}

      {!isEditing && isMyReview && (
        <div className={styles.actionButtons}>
          <button onClick={() => setIsEditing(true)} className={styles.actionButton}>수정</button>
          <button onClick={handleDelete} className={styles.actionButton}>삭제</button>
        </div>
      )}
    </div>
  );
};
