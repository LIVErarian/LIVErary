import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const contentWrapper = style({
  textAlign: 'center',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
});

// 에러 메시지 텍스트
export const errorMessage = style({
  fontSize: '1rem',
  color: theme.colors.black,
  lineHeight: '1.5',
  wordBreak: 'keep-all',
});

// 버튼 래퍼
export const buttonWrapper = style({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '1rem',
  width: '100%',
});
