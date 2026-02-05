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
  // border: `2px solid ${theme.colors.beigeMain}`, // 테두리도 원하면 제거 가능하지만 일단 배경만
  // borderRadius: '8px',
  // backgroundColor: theme.colors.paper, // 흰색(종이색) 배경 제거

  '::-webkit-scrollbar': {
    width: '10px',
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: theme.colors.beigeLight,
    borderRadius: '6px',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: theme.colors.woodMedium,
    borderRadius: '6px',
    border: `2px solid ${theme.colors.beigeLight}`,
  },
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
