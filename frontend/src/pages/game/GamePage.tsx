import { useEffect, useRef } from 'react';

import { GameLayout } from '@/components/layout/GameLayout';
import { useGame } from '@/features/core/useGame';
import { GameSidebar } from '@/features/ui/GameSidebar';
import { useGameStore } from '@/store/useGameStore';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { gameAppRef, isReady } = useGame(containerRef);
  const currentFloor = useGameStore((state) => state.currentFloor);

  /**
   * PixiJS가 준비된 후 층 변경 감지
   */
  useEffect(() => {
    if (gameAppRef.current && currentFloor && isReady) {
      console.log(`층 변경 감지: ${currentFloor}`);
      gameAppRef.current.changeMap(currentFloor);
    }
  }, [currentFloor, gameAppRef, isReady]);

  return <GameLayout canvasRef={containerRef} sideMenu={<GameSidebar />} />;
};
