import { useEffect, useRef, useState } from 'react';

import { GameApp } from './GameApp';

export const useGame = (
  containerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const gameAppRef = useRef<GameApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  /**
   * 게임 초기화 및 정리
   */
  useEffect(() => {
    // 컨테이너가 없거나 이미 게임이 켜져있는 경우 return
    if (!containerRef.current || gameAppRef.current) return;

    // 인스턴스 생성 및 초기화
    const gameApp = new GameApp();
    gameAppRef.current = gameApp;

    let isUnmounted = false;

    const initializeGame = async () => {
      await gameApp.init(containerRef.current!);

      // 초기화 끝났는데 이미 컴포넌트가 죽은 경우
      if (isUnmounted) {
        gameApp.destroy();
        return;
      }

      setIsReady(true);
    };

    initializeGame();

    // Cleanup
    return () => {
      console.log('GameApp destroyed');
      isUnmounted = true;

      gameApp.destroy();
      gameAppRef.current = null;
      setIsReady(false);
    };
  }, [containerRef]);

  return { gameAppRef, isReady };
};
