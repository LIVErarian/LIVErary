import { useEffect, useState } from 'react';

import { GameContent } from '@/features/core/GameContent';
import { LoadingScreen } from '@/features/ui/LoadingScreen';
import { preloadAssets } from '@/utils/preloadAssets';

export const GamePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const initAssets = async () => {
      try {
        const minTimePromise = new Promise(
          (resolve) => setTimeout(resolve, 3000), // 3초 대기
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
