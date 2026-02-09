import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  color: theme.colors.boardText,
});

export const description = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  lineHeight: 1.2,
  margin: 0,
  color: theme.colors.boardText,
  textAlign: 'center',
});

export const list = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '12px',
  padding: '6px',
  maxHeight: '400px',
  overflowY: 'auto',
});

export const emptyState = style({
  padding: '24px',
  textAlign: 'center',
  color: theme.colors.beigeText,
  fontSize: '0.9rem',
});

export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '4px',
});

const messageBase = style({
  fontSize: '0.8rem',
  textAlign: 'center',
  display: 'block',
  width: '100%',
  marginTop: '4px',
  minHeight: '1.2em',
  lineHeight: '1.2em',
});

export const helper = style([
  messageBase,
  {
    color: theme.colors.beigeText,
  },
]);

export const warning = style([
  messageBase,
  {
    color: theme.colors.red,
  },
]);
