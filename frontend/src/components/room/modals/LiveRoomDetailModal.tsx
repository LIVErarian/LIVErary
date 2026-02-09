import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import { PixelModal } from '@/components/common/PixelModal';
import { useJoinRoom } from '@/services/mutations/useRoomMutations';
import { useRoomDetail } from '@/services/queries/useRoomQueries';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './ScheduledRoomDetailModal.css';

interface LiveRoomDetailModalProps {
  roomId: string | null;
  onClose: () => void;
}

export const LiveRoomDetailModal = ({
  roomId,
  onClose,
}: LiveRoomDetailModalProps) => {
  const isModalOpen = !!roomId;
  const { closeModal, openModal } = useModalStore();
  const [code, setCode] = useState('');

  // 방 정보 조회
  const { data: room, isLoading } = useRoomDetail(roomId || undefined);
  const { mutate: joinRoom } = useJoinRoom();

  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setRoom4Room = useBookTalkRoomStore((state) => state.setRoom4Room);

  // 비밀방 여부
  const isPrivate = room?.accessType === 'PRIVATE';
  const isFull = room ? room.currentCount >= room.maxUser : false;

  const handleJoinSequence = () => {
    if (!room) return;

    // 1. 방 정보 스토어에 저장 (GameApp 등이 참고할 수 있도록)
    setRoom4Room({
      roomId: room.roomId,
      title: room.title,
      roomType: room.roomType,
      accessType: room.accessType,
      status: room.status,
      categoryName: room.categoryName,
      currentCount: room.currentCount, // 아직 입장 전이므로 현재 인원 그대로
      maxUser: room.maxUser,
    });

    // 2. 현재 모달들 닫기
    setCode('');
    onClose(); // LiveRoomDetailModal 닫기
    closeModal(); // 뒤에 깔린 RoomListModal 닫기

    // 3. 캐릭터 이동 (문 앞)
    setSpawnPoint({ x: 0.83, y: 0.65 });
    setCurrentFloor('bookTalkFloor');

    // 4. 도착 즉시 'EntranceModal' 띄우기
    openModal('entrance', {
      title: '방 입장',
      message: `'${room.title}' 방에 입장하시겠습니까?`,
      onConfirm: () => {
        joinRoom({
          roomId: room.roomId,
          req: { code: isPrivate ? code : '' },
        });
      },
    });
  };

  if (!isModalOpen) return null;

  const handleClose = () => {
    setCode('');
    onClose();
  };

  // 버튼 비활성화 조건
  const isButtonDisabled = isFull || (isPrivate && code.trim() === '');

  return (
    <PixelModal
      isOpen={isModalOpen}
      onClose={handleClose}
      title="진행 중인 방 정보"
      width="600px"
    >
      <div className={styles.container}>
        {isLoading || !room ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        ) : (
          <>
            <div className={styles.roomInfoCard}>
              <img
                src={room.bookCoverUrl || '/assets/icons/book_placeholder.png'}
                alt="책 표지"
                className={styles.bookCover}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className={styles.infoSection}>
                <div className={styles.roomTitle}>
                  {isPrivate && '🔒 '} {room.title}
                </div>
                <div className={styles.bookInfo}>
                  <span className={styles.bookTitleText}>
                    {room.bookTitle || '지정 도서 없음'}
                  </span>
                  <span className={styles.bookAuthorText}>
                    {room.bookAuthor || '-'}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.label}>카테고리</span>
                  <span>{room.categoryName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>인원</span>
                  <span>
                    {room.currentCount} / {room.maxUser} 명
                  </span>
                </div>

                {isPrivate && (
                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <PixelInput
                      placeholder="코드를 입력하세요"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      fullWidth
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.footer}>
              <PixelButton onClick={handleClose} variant="beige">
                닫기
              </PixelButton>

              <PixelButton
                onClick={handleJoinSequence} // API 호출 대신 시퀀스 실행
                variant="primary"
                disabled={isButtonDisabled}
              >
                {isFull ? '만원' : '참여하기'}
              </PixelButton>
            </div>
          </>
        )}
      </div>
    </PixelModal>
  );
};
