import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';

import type { FloorType } from '@/types/map.types';

export const ElevatorModal = () => {
  const { closeModal } = useModalStore();
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);

  // 층 이동
  const handleMove = (floor: FloorType) => {
    setCurrentFloor(floor);
    closeModal();
  };

  return (
    <PixelModal
      isOpen={true}
      onClose={closeModal}
      title="🛗 엘리베이터"
      width="320px"
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
            3F 독서 모임 공간
          </PixelButton>

          <PixelButton fullWidth onClick={() => handleMove('bookConcert')}>
            4F 북 콘서트 홀
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};
