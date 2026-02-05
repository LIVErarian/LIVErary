import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  width: '100%',
  marginTop: '2rem',
  borderTop: `2px dashed ${theme.colors.beigeDark}`,
  paddingTop: '2rem',
  boxSizing: 'border-box',
});

export const title = style({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  marginBottom: '1rem',
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem',
  width: '100%',
  boxSizing: 'border-box',
});

export const item = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '1rem',
  backgroundColor: theme.colors.white,
  border: `1px solid ${theme.colors.beigeLight}`,
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  width: '100%',
  boxSizing: 'border-box',
});

export const itemHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.9rem',
});

export const author = style({
  fontWeight: 'bold',
  color: theme.colors.primary,
});

export const date = style({
  color: theme.colors.beigeText,
  fontSize: '0.8rem',
});

export const content = style({
  fontSize: '1rem',
  color: theme.colors.boardText,
  whiteSpace: 'pre-wrap',
  lineHeight: '1.5',
});

export const actionButtons = style({
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'flex-end',
});

export const actionButton = style({
  fontSize: '0.8rem',
  padding: '0.2rem 0.5rem',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: theme.colors.beigeText,
  textDecoration: 'underline',
  ':hover': {
    color: theme.colors.primary,
  },
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  marginTop: '1rem',
  padding: '1.5rem',
  backgroundColor: theme.colors.beigeLight,
  borderRadius: '8px',
  width: '100%',
  boxSizing: 'border-box',
});

export const textarea = style({
  width: '100%',
  minHeight: '80px',
  padding: '0.8rem',
  borderRadius: '4px',
  border: `1px solid ${theme.colors.beigeDark}`,
  resize: 'vertical',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  ':focus': {
    outline: 'none',
    borderColor: theme.colors.primary,
  },
});

export const buttonWrapper = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

// Pagination
export const pagination = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '1rem',
  marginBottom: '1rem',
});

export const pageButton = style({
  padding: '0.3rem 0.6rem',
  backgroundColor: theme.colors.white,
  border: `1px solid ${theme.colors.beigeDark}`,
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  ':hover': {
    backgroundColor: theme.colors.beigeLight,
  },
  selectors: {
    '&[data-active="true"]': {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      borderColor: theme.colors.primary,
    },
  },
});
