import { useEffect, useState } from 'react';

import { GameContent } from '@/game/engine/GameContent';
import { LoadingScreen } from '@/game/ui/LoadingScreen';
import { preloadAssets } from '@/game/utils/preloadAssets';

export const GamePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const initAssets = async () => {
      try {
        const minTimePromise = new Promise(
          (resolve) => setTimeout(resolve, 2000), // 2초 대기
        );

        const assetLoadPromise = preloadAssets((progress) => {
          setLoadingProgress(progress);
        });

        await Promise.all([minTimePromise, assetLoadPromise]);

        setIsLoading(false);
      } catch (error) {
        console.error('자산 로딩 실패:', error);
      }
    };
    initAssets();
  }, []);

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return <GameContent />;
};
