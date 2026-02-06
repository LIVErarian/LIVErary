import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import {
  useApplyScheduledRoom,
  useDeleteApplyScheduledRoom,
  useDeleteScheduledRoom,
} from '@/hooks/mutations/useRoomMutations';
import {
  useMyScheduledRooms,
  useRoomDetail,
} from '@/hooks/queries/useRoomQueries';
import { useAuthStore } from '@/store/useAuthStore';

import * as styles from './ScheduledRoomDetailModal.css';

interface ScheduledRoomDetailModalProps {
  roomId: string | null;
  onClose: () => void;
}

export const ScheduledRoomDetailModal = ({
  roomId,
  onClose,
}: ScheduledRoomDetailModalProps) => {
  const isModalOpen = !!roomId;
  const { user } = useAuthStore();

  const { data: room, isLoading } = useRoomDetail(roomId || undefined);
  const { data: myRooms } = useMyScheduledRooms();

  // 권한 및 상태 체크
  const isHost = user && room && user.userId === room.hostId;
  const isApplied = myRooms?.some((r) => r.roomId === roomId);
  const hasParticipants = room ? room.currentCount > 1 : false;

  const { mutate: applyRoom, isPending: isApplying } = useApplyScheduledRoom();
  const { mutate: cancelApply, isPending: isCancelingApply } =
    useDeleteApplyScheduledRoom();
  const { mutate: deleteRoom, isPending: isDeletingRoom } =
    useDeleteScheduledRoom();

  if (!isModalOpen) return null;

  const handleHostDelete = () => {
    // 혹시 모를 방어 코드
    if (hasParticipants) {
      alert('다른 참여자가 있어 방을 삭제할 수 없습니다.');
      return;
    }

    if (confirm('방 예약을 완전히 삭제하시겠습니까?')) {
      if (roomId) {
        deleteRoom({ roomId }, { onSuccess: () => onClose() });
      }
    }
  };

  const handleUserApply = () => {
    if (roomId) applyRoom({ roomId });
  };

  const handleUserCancelApply = () => {
    if (confirm('참여 신청을 취소하시겠습니까?')) {
      if (roomId) cancelApply({ roomId });
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PixelModal
      isOpen={isModalOpen}
      onClose={onClose}
      title="방 상세 정보"
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
                <div className={styles.roomTitle}>{room.title}</div>
                <div className={styles.bookInfo}>
                  <span className={styles.bookTitleText}>
                    {room.bookTitle || '지정 도서 없음'}
                  </span>
                  <span className={styles.bookAuthorText}>
                    {room.bookAuthor || '-'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>일시</span>
                  <span>{formatTime(room.startAt)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>인원</span>
                  <span>
                    {room.currentCount} / {room.maxUser} 명
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>분류</span>
                  <span>{room.categoryName}</span>
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <PixelButton onClick={onClose} variant="beige">
                닫기
              </PixelButton>

              {isHost ? (
                // 방장 (참여자가 있으면 버튼 비활성화)
                <PixelButton
                  onClick={handleHostDelete}
                  disabled={isDeletingRoom || hasParticipants} // 참여자 있으면 disabled
                  variant={!hasParticipants ? 'danger' : 'disabled'}
                >
                  {hasParticipants ? '참여자 존재 (취소불가)' : '방 삭제'}
                </PixelButton>
              ) : isApplied ? (
                // 참여자인 경우 신청 취소
                <PixelButton
                  onClick={handleUserCancelApply}
                  variant="danger"
                  disabled={isCancelingApply}
                >
                  신청 취소
                </PixelButton>
              ) : (
                // 미참여자인 경우 참여 신청
                <PixelButton
                  onClick={handleUserApply}
                  variant="primary"
                  disabled={isApplying || room.currentCount >= room.maxUser}
                >
                  {room.currentCount >= room.maxUser ? '만원' : '참여 신청'}
                </PixelButton>
              )}
            </div>
          </>
        )}
      </div>
    </PixelModal>
  );
};
