import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 전체 컨테이너
export const container = style({
  width: '100vw',
  height: '100vh',
  backgroundColor: theme.colors.background,
  overflow: 'hidden', // 스크롤 방지
  display: 'flex', // 좌우 정렬에 사용
  flexDirection: 'row', // 가로 배치
});

// 왼쪽 사이드바
export const sidebar = style({
  width: '64px',
  height: '100%',
  backgroundColor: theme.colors.black,
  borderRight: `1px solid ${theme.colors.white}`, // 구분선
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '16px',
});

// 오른쪽 게임 화면 영역
export const gameArea = style({
  flex: 1,
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
});

// Canvas Wrapper
export const canvasWrapper = style({
  width: '100%',
  height: '100%',
  display: 'block',
});
