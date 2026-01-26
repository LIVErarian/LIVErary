import type { ReactNode, RefObject } from 'react';

import * as styles from './GameLayout.css';

interface GameLayoutProps {
  canvasRef: RefObject<HTMLDivElement | null>; // PixiJS가 붙을 div
  sideMenu: ReactNode; // 사이드 메뉴
  children: ReactNode; // 위에 띄울 UI
}

export const GameLayout = ({
  canvasRef,
  sideMenu,
  children,
}: GameLayoutProps) => {
  return (
    <div className={styles.container}>
      {/* 왼쪽 사이드바 */}
      <aside className={styles.sidebar}>{sideMenu}</aside>

      {/* 오른쪽 게임 영역 */}
      <main className={styles.gameArea}>
        {/* 게임 화면(Layer 0) */}
        <div ref={canvasRef} className={styles.canvasLayer} />

        {/* UI 레이어(Layer 1) */}
        <div className={styles.uiLayer}>{children}</div>
      </main>
    </div>
  );
};
