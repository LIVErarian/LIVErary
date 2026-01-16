import { useEffect, useRef } from 'react';

import { GameApp } from './GameApp';

export const useGame = (
  containerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const gameAppRef = useRef<GameApp | null>(null);

  useEffect(() => {
    // 컨테이너가 없거나 이미 게임이 켜져있는 경우 return
    if (!containerRef.current || gameAppRef.current) return;

    // 인스턴스 생성 및 초기화
    const gameApp = new GameApp();
    gameAppRef.current = gameApp;

    // 초기화
    gameApp.init(containerRef.current).then(() => {
      console.log('GameApp initialized');
    });

    // Cleanup
    return () => {
      console.log('GameApp destroyed');
      gameApp.destroy();
      gameAppRef.current = null;
    };
  }, [containerRef]);
};
