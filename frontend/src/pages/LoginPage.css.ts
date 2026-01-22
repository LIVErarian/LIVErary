import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
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

export const formContainer = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const description = style({
  color: theme.colors.woodLight,
  marginBottom: '24px',
  opacity: 0.8,
  textAlign: 'center',
  fontSize: '0.9rem',
});

// 회원가입, 비밀번호 찾기
export const linkGroup = style({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '12px',
  fontSize: '0.8rem',
  color: '#bcaaa4',
});

export const link = style({
  cursor: 'pointer',
  transition: 'color 0.2s',
  ':hover': {
    color: theme.colors.woodLight,
    textDecoration: 'underline',
  },
});
