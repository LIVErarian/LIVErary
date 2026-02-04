import { useEffect, useRef } from 'react';

import { GameLayout } from '@/components/layout/GameLayout';
import { useGame } from '@/features/core/useGame';
import { BookTalkCategoryDropdown } from '@/features/ui/BookTalkCategoryDropdown';
import { GameSidebar } from '@/features/ui/GameSidebar';
import { useGameStore } from '@/store/useGameStore';
import { useSocketStore } from '@/store/useSocketStore';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { gameAppRef, isReady } = useGame(containerRef);
  const lastFloorRef = useRef<string | null>(null);
  const currentFloor = useGameStore((state) => state.currentFloor);
  const spawnPoint = useGameStore((state) => state.spawnPoint);

  const { connect, disconnect } = useSocketStore();

  /**
   * 게임 화면에서 연결 유지
   */
  useEffect(() => {
    connect();
    // 컴포넌트 언마운트 시에만 연결 해제
    return () => disconnect();
  }, [connect, disconnect]);

  /**
   * PixiJS가 준비된 후 층 변경 감지
   */
  useEffect(() => {
    if (gameAppRef.current && currentFloor && isReady) {
      const isSameFloor = lastFloorRef.current === currentFloor;
      const hasSpawnPoint = !!spawnPoint;

      if (isSameFloor && !hasSpawnPoint) return;

      console.log(
        `층 변경/이동 시도: ${currentFloor} (Spawn: ${hasSpawnPoint})`,
      );
      gameAppRef.current.changeMap(currentFloor);

      // 층이 변경되면 lastFloorRef 업데이트
      lastFloorRef.current = currentFloor;
    }
  }, [currentFloor, spawnPoint, gameAppRef, isReady]);

  return (
    <GameLayout canvasRef={containerRef} sideMenu={<GameSidebar />}>
      <BookTalkCategoryDropdown />
    </GameLayout>
  );
};
