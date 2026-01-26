import { useEffect, useRef } from 'react';

import { GameLayout } from '@/components/layout/GameLayout';
import { useGame } from '@/features/core/useGame';
import { GameUiOverlay } from '@/features/ui/GameUiOverlay';
import { useGameStore } from '@/store/useGameStore';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const gameAppRef = useGame(containerRef);

  // 스토어 연동
  const currentFloor = useGameStore((state) => state.currentFloor);

  useEffect(() => {
    if (gameAppRef.current && currentFloor) {
      console.log(`층 변경 감지: ${currentFloor}`);
      gameAppRef.current.changeMap(currentFloor);
    }
  }, [currentFloor, gameAppRef]);

  return (
    <GameLayout canvasRef={containerRef}>
      <GameUiOverlay />
    </GameLayout>
  );
};
