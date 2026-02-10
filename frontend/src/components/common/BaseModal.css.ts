import { keyframes, style } from '@vanilla-extract/css';

const popIn = keyframes({
  '0%': { transform: 'scale(0.95)', opacity: 0 },
  '100%': { transform: 'scale(1)', opacity: 1 },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'auto',
});

// 애니메이션 공통 처리
export const contentWrapper = style({
  animation: `${popIn} 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
  pointerEvents: 'auto',
});
