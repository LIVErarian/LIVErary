import { PixelButton } from '@/components/common/PixelButton';
import { useGameStore } from '@/store/useGameStore';

import * as styles from '@/components/layout/GameLayout.css';

export const MyRoomUI = () => {
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);

  return (
    <div
      className={styles.interactive}
      style={{ display: 'flex', gap: '10px' }}
    >
      <PixelButton size="md" onClick={() => setCurrentFloor('lobby')}>
        로비로 이동하기
      </PixelButton>
    </div>
  );
};
