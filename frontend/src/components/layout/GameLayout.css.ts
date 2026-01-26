import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 전체 컨테이너 (사이드바 + 게임역역)
export const container = style({
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: theme.colors.background,
  display: 'flex',
  flexDirection: 'row',
});

// 왼쪽 사이드바
export const sidebar = style({
  width: '128px',
  height: '100%',
  backgroundColor: theme.colors.black,
  borderRight: `1px solid ${theme.colors.white}`,
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '16px',
});

// 오른쪽 게임 영역
export const gameArea = style({
  flex: 1,
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
});

// 게임 캔버스 (Layer 0)
export const canvasLayer = style({
  position: 'absolute',
  inset: 0,
  zIndex: 0,
});

// UI 레이어 (Layer 1)
export const uiLayer = style({
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  pointerEvents: 'none', // UI 영역은 클릭 무시
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '16px',
});

export const interactive = style({
  pointerEvents: 'auto', // 클릭 감지 활성화
});
