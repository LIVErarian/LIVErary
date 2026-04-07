import { roomApi } from '@/api/room.api';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { useSocketStore } from '@/store/useSocketStore';

import type { FloorType } from '@/types/game/map.types';

interface ElevatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
}

export const ElevatorModal = ({
  isOpen,
  onClose,
  zIndex,
}: ElevatorModalProps) => {
  const { openModal } = useModalStore();
  const { currentFloor, roomId, setCurrentFloor, setRoomId } = useGameStore();
  const sendLeaveRoom = useSocketStore((state) => state.sendLeaveRoom);

  // 층 이동
  const handleMove = async (floor: FloorType) => {
    if (currentFloor === 'conferenceFloor' && roomId) {
      try {
        // 회의실 퇴장: STOMP + HTTP 동시 전송
        sendLeaveRoom({ roomId });
        await roomApi.leaveRoom({ roomId });
        setRoomId(null);
      } catch (error: unknown) {
        console.error('회의실 퇴장 실패:', error);
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        openModal('alert', {
          title: '오류',
          message:
            apiError?.response?.data?.message ??
            '퇴장 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }
    }
    setCurrentFloor(floor);
    onClose();
  };

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title="🛗 엘리베이터"
      width="320px"
      zIndex={zIndex}
    >
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <p style={{ color: '#3E2723', marginBottom: '8px' }}>
          이동할 층을 선택하세요.
        </p>

        {/* 버튼 목록 */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}
        >
          <PixelButton fullWidth onClick={() => handleMove('lobby')}>
            1F 중앙 로비
          </PixelButton>

          <PixelButton fullWidth onClick={() => handleMove('readingFloor')}>
            2F 독서실
          </PixelButton>

          <PixelButton fullWidth onClick={() => handleMove('bookTalkFloor')}>
            3F 독서 모임
          </PixelButton>

          <PixelButton fullWidth onClick={() => handleMove('bookConcert')}>
            4F 북 콘서트 홀
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};
