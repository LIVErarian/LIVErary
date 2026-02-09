import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  textAlign: 'center',
  padding: '20px 10px',
  minHeight: '180px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '2rem',
  color: theme.colors.black,
});

export const loading = style({
  fontSize: '1rem',
  color: theme.colors.beigeText,
});

export const error = style({
  fontSize: '0.9rem',
  color: theme.colors.red,
});

export const content = style({
  fontSize: '1.1rem',
  fontWeight: 'bold',
  lineHeight: '1.6',
  wordBreak: 'keep-all',
  margin: 0,
});

export const metaInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  fontSize: '0.85rem',
  color: theme.colors.beigeText,
});

export const bookTitle = style({
  fontWeight: 600,
  color: theme.colors.primary,
});
