import { Assets, extensions, ExtensionType } from 'pixi.js';

import { manifest } from '@/assets/assetsManifest';

const mp3Loader = {
  extension: {
    type: ExtensionType.LoadParser,
    priority: Highlight,
  },
  name: 'mp3-loader',
  test: (url: string) => url.endsWith('.mp3'),
  load: async (url: string) => {
    // 실제 파일을 요청해서 브라우저 캐시에 저장
    await fetch(url);
    // PixiJS asset에서는 url 문자열만 저장
    return url;
  },
};

extensions.add(mp3Loader);

export const preloadAssets = async (
  onProgress?: (progress: number) => void,
) => {
  try {
    // manifest 초기화
    if (!Assets.resolver.basePath) {
      await Assets.init({ manifest });
      console.log('📦 PixiJS Assets Initialized');
    }
  } catch (e) {
    // React StrictMode로 인해 두 번 실행될 때 발생하는 'already initialized' 경고 무시
    console.warn('⚠️ Assets init warning (can be ignored in dev):', e);
  }

  // 모든 번들 ID 추출
  const bundleIds = manifest.bundles.map((b) => b.name);

  // 로드 시작
  await Assets.loadBundle(bundleIds, (progress) => {
    if (onProgress) onProgress(progress);
  });

  console.log('✅ 모든 자산 로딩 완료');
};
