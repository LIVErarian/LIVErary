import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { useCreateReview } from '@/hooks/queries/useReview';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './Review.css';

interface ReviewFormProps {
  boardId: string;
}

export const ReviewForm = ({ boardId }: ReviewFormProps) => {
  const [content, setContent] = useState('');
  const { user } = useAuthStore();
  const { openModal } = useModalStore();
  const { mutate: createReview, isPending } = useCreateReview(boardId);
  const handleSubmit = () => {
    if (!user) {
      return openModal('alert', {
        title: '알림',
        message: '로그인이 필요한 서비스입니다.',
      });
    }
    if (!content.trim())
      return openModal('alert', {
        title: '알림',
        message: '리뷰 내용을 입력해주세요.',
      });

    createReview(
      { boardId, content },
      {
        onSuccess: () => setContent(''),
      },
    );
  };

  return (
    <div className={styles.form}>
      <textarea
        className={styles.textarea}
        placeholder="리뷰를 작성해주세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className={styles.buttonWrapper}>
        <PixelButton onClick={handleSubmit} disabled={isPending}>
          {isPending ? '등록 중...' : '리뷰 등록'}
        </PixelButton>
      </div>
    </div>
  );
};
