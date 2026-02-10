import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import {
  useApplyScheduledRoom,
  useDeleteApplyScheduledRoom,
  useDeleteScheduledRoom,
} from '@/services/mutations/useRoomMutations';
import {
  useMyScheduledRooms,
  useRoomDetail,
} from '@/services/queries/useRoomQueries';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

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
  const { openModal } = useModalStore();

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

  // 방 수정 핸들러: 기존 정보를 editRoom으로 전달
  const handleHostEdit = () => {
    if (!room) return;

    // 현재 상세 모달 닫기
    onClose();

    // 방 생성 모달을 '수정 모드'로 열기
    // editRoom에 현재 room 객체를 그대로 전달합니다.
    openModal('createRoom', {
      editRoom: {
        room: room,
      },
    });
  };

  const handleHostDelete = () => {
    // 혹시 모를 방어 코드
    if (hasParticipants) {
      openModal('alert', {
        title: '알림',
        message: '다른 참여자가 있어 방을 삭제할 수 없습니다.',
      });
      return;
    }

    openModal('confirm', {
      title: '예약 취소',
      message: '방 예약을 완전히 삭제하시겠습니까?',
      isDanger: true,
      onConfirm: () => {
        if (roomId) {
          deleteRoom(
            { roomId },
            {
              onSuccess: onClose, // 성공 시 모달 닫기
            },
          );
        }
      },
    });
  };

  const handleUserApply = () => {
    if (roomId) applyRoom({ roomId });
  };

  const handleUserCancelApply = () => {
    openModal('confirm', {
      title: '참여 취소',
      message: '참여 신청을 취소하시겠습니까?',
      isDanger: true,
      onConfirm: () => {
        if (roomId) {
          cancelApply(
            { roomId },
            {
              onSuccess: onClose,
            },
          );
        }
      },
    });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    // 백엔드에서 Z 없이 주는 경우(UTC 기준)를 대비해 Z가 없으면 붙여서 처리
    const validIsoString = isoString.endsWith('Z')
      ? isoString
      : `${isoString}Z`;

    return new Date(validIsoString).toLocaleString('ko-KR', {
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
          <div className={styles.loadingMessage}>로딩 중...</div>
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
                // 방장일 경우: 수정 / 삭제 버튼 노출
                <div className={styles.hostButtonGroup}>
                  <PixelButton onClick={handleHostEdit} variant="primary">
                    수정
                  </PixelButton>
                  <PixelButton
                    onClick={handleHostDelete}
                    disabled={isDeletingRoom || hasParticipants}
                    variant={!hasParticipants ? 'danger' : 'disabled'}
                  >
                    {hasParticipants ? '취소 불가' : '예약 취소'}
                  </PixelButton>
                </div>
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
