import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const panelContainer = style({
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 100,

  backgroundColor: theme.colors.paper,
  border: `4px solid ${theme.colors.woodDeep}`,
  borderRadius: '12px',
  padding: '16px 24px',
  boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',

  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  alignItems: 'center',
  minWidth: '300px',
});

export const timerDisplay = style({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  letterSpacing: '2px',
  fontFamily: 'monospace',
  cursor: 'help',
});

export const bookTitle = style({
  fontSize: '0.9rem',
  color: theme.colors.beigeText,
  textAlign: 'center',
  maxWidth: '250px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const buttonGroup = style({
  display: 'flex',
  gap: '8px',
  marginTop: '8px',
});
