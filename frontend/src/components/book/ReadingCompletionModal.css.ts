import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

export const bookInfo = style({
  textAlign: 'center',
  padding: '16px',
  backgroundColor: theme.colors.beigeLight,
  borderRadius: '8px',
});

export const bookTitle = style({
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});

export const timeDisplay = style({
  textAlign: 'center',
  padding: '20px',
  border: `3px solid ${theme.colors.woodDeep}`,
  borderRadius: '12px',
});

export const timeLabel = style({
  fontSize: '0.85rem',
  color: theme.colors.beigeText,
  marginBottom: '8px',
});

export const timeValue = style({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});

export const completionCheck = style({
  padding: '16px',
  backgroundColor: theme.colors.beigeLight,
  borderRadius: '8px',
  textAlign: 'center',
});

export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
});
