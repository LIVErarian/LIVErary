import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 기존 PixelModal 톤을 유지하면서 카테고리 다중 선택용 레이아웃만 추가한다.
export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  color: theme.colors.boardText,
});

export const description = style({
  fontSize: '0.9rem',
  lineHeight: 1.5,
  color: theme.colors.beigeText,
});

export const list = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
  gap: '8px',
  padding: '6px',
  maxHeight: '240px',
  overflowY: 'auto',
  border: `2px solid ${theme.colors.beigeMain}`,
  borderRadius: '8px',
  backgroundColor: theme.colors.paper,

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
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '4px',
});

export const helper = style({
  fontSize: '0.8rem',
  color: theme.colors.beigeText,
});
