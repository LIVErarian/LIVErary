import { Assets } from 'pixi.js';

import { manifest } from '@/assets/assetsManifest';

export const preloadAssets = async (
  onProgress?: (progress: number) => void,
) => {
  // 매니페스트 초기화
  if (!Assets.resolver.basePath) {
    await Assets.init({ manifest });
  }

  // 필요한 번들 ID 추출
  const bundleIds = manifest.bundles.map((b) => b.name);

  // 로드 시작
  await Assets.loadBundle(bundleIds, (progress) => {
    if (onProgress) onProgress(progress);
  });

  console.log('모든 게임 자산 로딩 완료');
};
