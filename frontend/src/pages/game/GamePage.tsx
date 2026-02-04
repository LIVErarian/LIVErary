import { useEffect, useRef } from 'react';

import { GameLayout } from '@/components/layout/GameLayout';
import { useGame } from '@/features/core/useGame';
import { BookTalkCategoryDropdown } from '@/features/ui/BookTalkCategoryDropdown';
import { GameSidebar } from '@/features/ui/GameSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { useSocketStore } from '@/store/useSocketStore';
import { hasPreferenceCompleted } from '@/utils/preferences';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { gameAppRef, isReady } = useGame(containerRef);
  const lastFloorRef = useRef<string | null>(null);
  const currentFloor = useGameStore((state) => state.currentFloor);
  const spawnPoint = useGameStore((state) => state.spawnPoint);

  const { connect, disconnect } = useSocketStore();
  const { openModal } = useModalStore();
  const userId = useAuthStore((state) => state.user?.userId);

  /**
   * 게임 화면에서 연결 유지
   */
  useEffect(() => {
    connect();
    // 컴포넌트 언마운트 시에만 연결 해제
    return () => disconnect();
  }, [connect, disconnect]);

  // 유저별 localStorage 플래그가 없을 때만 선호 카테고리 모달을 노출한다.
  useEffect(() => {
    if (!userId) return;
    if (hasPreferenceCompleted(userId)) return;
    openModal('preferences');
  }, [openModal, userId]);

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
