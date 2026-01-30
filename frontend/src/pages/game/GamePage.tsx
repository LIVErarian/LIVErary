import { useEffect, useRef } from 'react';

import { GameLayout } from '@/components/layout/GameLayout';
import { useGame } from '@/features/core/useGame';
import { GameSidebar } from '@/features/ui/GameSidebar';
import { useGameStore } from '@/store/useGameStore';
import { useSocketStore } from '@/store/useSocketStore';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { gameAppRef, isReady } = useGame(containerRef);
  const currentFloor = useGameStore((state) => state.currentFloor);

  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);

  useEffect(() => {
    connect();
    return () => disconnect(); // 나갈 땐 끊기
  }, [connect, disconnect]);

  // ✨ 화면에 상태 표시 (테스트용)
  console.log('현재 소켓 상태:', isConnected ? '🟢 연결됨' : '🔴 연결 안됨');

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
