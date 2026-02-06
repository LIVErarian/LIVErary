import { useRoomDetail } from '@/hooks/queries/useRoomQueries';
import { useGameStore } from '@/store/useGameStore';

import * as styles from './ConferenceRoomInfoPanel.css';

export const ConferenceRoomInfoPanel = () => {
  const currentFloor = useGameStore((state) => state.currentFloor);
  const roomId = useGameStore((state) => state.roomId);
  const storedCode = useGameStore((state) => state.roomCode);
  const targetRoomId =
    currentFloor === 'conferenceFloor' ? (roomId ?? undefined) : undefined;
  const { data: roomDetail, isLoading } = useRoomDetail(targetRoomId);

  if (currentFloor !== 'conferenceFloor') return null;
  if (!targetRoomId) return null;

  if (isLoading && !roomDetail) {
    return (
      <section className={styles.panel} aria-label="회의실 방 정보 패널">
        <p className={styles.muted}>방 정보를 불러오는 중...</p>
      </section>
    );
  }

  if (!roomDetail) return null;

  const hasBookInfo =
    Boolean(roomDetail.bookTitle?.trim()) ||
    Boolean(roomDetail.bookAuthor?.trim()) ||
    Boolean(roomDetail.bookCoverUrl?.trim());

  const isPrivate = roomDetail.accessType === 'PRIVATE';

  const displayCode = storedCode;

  const handleCopyCode = () => {
    if (displayCode) {
      navigator.clipboard.writeText(displayCode);
      alert('입장 코드가 복사되었습니다.');
    }
  };

  return (
    <section className={styles.panel} aria-label="회의실 방 정보 패널">
      <h3 className={styles.title}>{roomDetail.title}</h3>

      <div className={styles.chipRow}>
        <span className={styles.chip}>
          {roomDetail.categoryName || '카테고리 없음'}
        </span>
        <span className={styles.chip}>
          인원 {roomDetail.currentCount} / {roomDetail.maxUser}
        </span>
      </div>

      {isPrivate && displayCode && (
        <div className={styles.codeContainer}>
          <span className={styles.codeLabel}>입장 코드</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className={styles.codeValue}>{displayCode}</span>
            <button
              className={styles.copyButton}
              onClick={handleCopyCode}
              aria-label="코드 복사"
            >
              복사
            </button>
          </div>
        </div>
      )}

      {hasBookInfo ? (
        <div className={styles.bookCard}>
          {roomDetail.bookCoverUrl ? (
            <img
              className={styles.cover}
              src={roomDetail.bookCoverUrl}
              alt={`${roomDetail.bookTitle || '책'} 표지`}
            />
          ) : (
            <div className={styles.cover} />
          )}
          <div className={styles.bookText}>
            {roomDetail.bookTitle && (
              <>
                <p className={styles.label}>제목</p>
                <p className={styles.value}>{roomDetail.bookTitle}</p>
              </>
            )}
            {roomDetail.bookAuthor && (
              <>
                <p className={styles.label}>저자</p>
                <p className={styles.value}>{roomDetail.bookAuthor}</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className={styles.muted}>연결된 책 정보가 없습니다.</p>
      )}
    </section>
  );
};
