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
  backgroundColor: theme.colors.side,
  borderRight: `1px solid ${theme.colors.white}`,
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

// 사이드바 메뉴 (전체 레이아웃)
export const sidebarMenu = style({
  width: '100%',
  boxSizing: 'border-box',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '32px 8px',
  alignItems: 'center',
  justifyContent: 'space-between',
});

// 사이드바 상단 아이콘
export const sidebarButton = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  alignItems: 'center',
});

// 하단 프로필 영역
export const profileSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
  marginTop: 'auto',
});

// 프로필
export const profileRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
});

// 아바타
export const avatarCircle = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: theme.colors.primary,
  border: '2px solid #240d04',
});

// 사용자 이름
export const playerName = style({
  color: theme.colors.white,
  fontWeight: 'bold',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
});

// 미디어 컨트롤 (마이크 버튼)
export const mediaRow = style({
  display: 'flex',
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
