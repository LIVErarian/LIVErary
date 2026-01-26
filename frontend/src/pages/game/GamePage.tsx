import { useRef } from 'react';

import { GameLayout } from '@/components/layout/GameLayout';
import { useGame } from '@/features/core/useGame';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 게임 엔진 가동
  useGame(containerRef);

  return (
    <GameLayout canvasRef={containerRef}>
      {/* TODO: GameOverlay 추가 */}
      ui
    </GameLayout>
  );
};
