import { style } from '@vanilla-extract/css';

import { theme as vars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '500px', // 고정 높이 설정
  gap: '12px',
  padding: '4px',
});

export const emptyState = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100px',
  color: vars.colors.disabledText,
  fontSize: '14px',
});

export const list = style({
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#f5f5f5', // Light gray standard
  borderRadius: '8px',
  cursor: 'pointer',
  position: 'relative',
  transition: 'all 0.2s',
  border: '2px solid transparent',
  opacity: 0.5, // 기본적으로 투명하게 (읽음 상태)
  ':hover': {
    backgroundColor: '#e0e0e0',
    borderColor: vars.colors.primary,
    opacity: 1, // 호버 시 불투명
  },
});

export const unread = style({
  backgroundColor: '#fff8e1', // Light yellow for unread
  borderColor: vars.colors.red,
  opacity: 1, // 안 읽은 알림은 항상 잘 보여야 함
});

export const icon = style({
  fontSize: '20px',
});

export const content = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const message = style({
  fontSize: '14px',
  margin: 0,
  color: vars.colors.black,
  fontWeight: 500,
});

export const date = style({
  fontSize: '12px',
  color: vars.colors.disabledText,
});

export const dot = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: vars.colors.red, // Red/Orange for attention
});
