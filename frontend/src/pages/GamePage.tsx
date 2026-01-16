import { useRef } from 'react';

import { useGame } from '@/features/core/useGame';

import * as styles from './GamePage.css.ts';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGame(containerRef);

  return (
    <div className={styles.container}>
      {/* 왼쪽 사이드바 UI */}
      <aside className={styles.sidebar}>
        <div style={{ color: 'white' }}>Menu</div>
      </aside>

      {/* 오른쪽 게임 영역 */}
      <main className={styles.gameArea}>
        <div ref={containerRef} className={styles.canvasWrapper} />
      </main>
    </div>
  );
};
