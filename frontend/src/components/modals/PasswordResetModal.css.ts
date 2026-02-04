import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
});

export const inputGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

// PixelInput을 사용하므로 input, inputWrapper, label 스타일 삭제

export const errorMessage = style({
  color: theme.colors.red,
  fontSize: '0.8rem',
  whiteSpace: 'pre-wrap',
  fontWeight: 'bold',
});

export const buttonGroup = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '8px',
});
