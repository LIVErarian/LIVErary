import { PixelButton } from '@/components/common/PixelButton';
import { useReadingTimer } from '@/hooks/queries/useReadingTimer';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { useReadingStore } from '@/store/useReadingStore';

import * as styles from './ReadingTimerPanel.css';

export const ReadingTimerPanel = () => {
  const currentFloor = useGameStore((state) => state.currentFloor);
  const { isReading, currentBook } = useReadingStore();
  const { formattedTime, formattedTimeDetailed } = useReadingTimer();
  const { openModal } = useModalStore();

  // 2층이 아니면 표시하지 않음
  if (currentFloor !== 'readingFloor') {
    return null;
  }

  const handleStartReading = () => {
    openModal('bookSelection');
  };

  const handleChangeBook = () => {
    openModal('bookSelection', { isChanging: true });
  };

  const handleEndReading = () => {
    openModal('readingCompletion');
  };

  return (
    <div className={styles.panelContainer}>
      {/* 타이머 (호버 시 상세 표시) */}
      <div className={styles.timerDisplay} title={formattedTimeDetailed}>
        {formattedTime}
      </div>

      {/* 현재 읽는 책 */}
      {isReading && currentBook && (
        <div className={styles.bookTitle}>📖 {currentBook.title}</div>
      )}

      {/* 버튼 */}
      <div className={styles.buttonGroup}>
        {!isReading ? (
          <PixelButton size="sm" variant="primary" onClick={handleStartReading}>
            독서 시작
          </PixelButton>
        ) : (
          <>
            <PixelButton size="sm" variant="beige" onClick={handleChangeBook}>
              책 변경
            </PixelButton>
            <PixelButton size="sm" variant="danger" onClick={handleEndReading}>
              독서 종료
            </PixelButton>
          </>
        )}
      </div>
    </div>
  );
};
