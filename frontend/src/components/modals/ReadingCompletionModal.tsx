import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { updateBookStatus } from '@/api/book.api';
import { recordReadingTime } from '@/api/reading.api';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useModalStore } from '@/store/useModalStore';
import { useReadingStore } from '@/store/useReadingStore';

import * as styles from './ReadingCompletionModal.css';

export const ReadingCompletionModal = () => {
  const { currentModal, closeModal } = useModalStore();
  const isOpen = currentModal === 'readingCompletion';
  const { elapsedSeconds, currentBook, endReading } = useReadingStore();
  const queryClient = useQueryClient();

  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    setIsSaving(true);

    try {
      // 시간 저장
      const minutes = Math.floor(elapsedSeconds / 60);
      if (minutes > 0) {
        await recordReadingTime(minutes);
      }

      // 완독 처리
      if (isCompleted && currentBook) {
        await updateBookStatus(currentBook.isbn, 'COMPLETED');
      }

      // 프로필 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });

      endReading();
      closeModal();
    } catch (error) {
      console.error('독서 종료 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  };

  if (!isOpen) return null;

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={closeModal}
      title="독서 종료"
      width="400px"
    >
      <div className={styles.container}>
        {currentBook && (
          <div className={styles.bookInfo}>
            <div className={styles.bookTitle}>📖 {currentBook.title}</div>
          </div>
        )}

        <div className={styles.timeDisplay}>
          <div className={styles.timeLabel}>총 독서 시간</div>
          <div className={styles.timeValue}>{formatTime(elapsedSeconds)}</div>
        </div>

        <div className={styles.completionCheck}>
          <label>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            <span>이 책을 다 읽으셨나요?</span>
          </label>
        </div>

        <div className={styles.footer}>
          <PixelButton size="sm" variant="beige" onClick={closeModal}>
            취소
          </PixelButton>
          <PixelButton
            size="sm"
            variant="primary"
            onClick={handleConfirm}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '확인'}
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};
