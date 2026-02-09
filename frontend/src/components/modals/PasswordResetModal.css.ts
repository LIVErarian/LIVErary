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

export const errorMessage = style({
  color: theme.colors.red,
  fontSize: '0.8rem',
  whiteSpace: 'pre-wrap',
  fontWeight: 'bold',
});

export const buttonGroup = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '24px',
  marginTop: '8px',
});

export const button = style({
  width: '155px',
  transition: 'transform 0.2s',
  ':hover': {
    transform: 'scale(1.05)',
  },
});
