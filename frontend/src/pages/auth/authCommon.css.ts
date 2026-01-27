import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const pageContainer = style({
  width: '100vw',
  height: '100vh',
  backgroundColor: theme.colors.background,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  imageRendering: 'pixelated',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

// 폼 내부요소 정렬
export const formWrapper = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

// 하단 링크 텍스트 스타일
export const footerText = style({
  textAlign: 'center',
  marginTop: '12px',
  fontSize: '0.9rem',
  color: theme.colors.boardText,
});

// 클릭 가능한 링크 스타일
export const linkText = style({
  marginLeft: '8px',
  fontWeight: 'bold',
  textDecoration: 'underline',
  cursor: 'pointer',
  color: theme.colors.primary,
  transition: 'color 0.2s',
  ':hover': {
    color: theme.colors.red,
  },
});
