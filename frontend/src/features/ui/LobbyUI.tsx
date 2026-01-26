import { PixelButton } from '@/components/common/PixelButton';
import { useGameStore } from '@/store/useGameStore';

import * as styles from '@/components/layout/GameLayout.css';

export const LobbyUI = () => {
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);

  return (
    <div className={styles.interactive}>
      <PixelButton size="md" onClick={() => setCurrentFloor('myRoom')}>
        마이룸
      </PixelButton>
      <PixelButton size="md">방 만들기</PixelButton>
    </div>
  );
};
