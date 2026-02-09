import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const wrapper = style({
  position: 'absolute',
  top: '16px',
  right: '16px',
  zIndex: 20,
  pointerEvents: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '12px',
  backgroundColor: theme.colors.woodDeep,
  border: `1px solid ${theme.colors.woodMedium}`,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
});

export const label = style({
  color: theme.colors.beigeLight,
  fontSize: '0.9rem',
  fontWeight: 700,
});

export const select = style({
  minWidth: '160px',
  padding: '6px 10px',
  borderRadius: '8px',
  border: `1px solid ${theme.colors.woodMedium}`,
  backgroundColor: theme.colors.beigeMain,
  color: theme.colors.beigeText,
  fontSize: '0.9rem',
  fontWeight: 600,
  outline: 'none',
  cursor: 'pointer',

  ':focus': {
    borderColor: theme.colors.beigeDark,
    boxShadow: `0 0 0 2px ${theme.colors.beigeLight}`,
  },
});
