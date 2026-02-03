import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  padding: '8px 4px',
});

export const pixelSelect = style({
  width: '100%',
  height: '48px',
  padding: '0 16px',
  backgroundColor: theme.colors.inputBg,
  color: theme.colors.inputText,
  fontFamily: 'inherit',
  fontSize: '1rem',
  outline: 'none',
  border: 'none',
  appearance: 'none', // 기본 화살표 표시 제거
  cursor: 'pointer',
  marginTop: '4px',

  boxShadow: `
    inset 4px 4px 0px 0px rgba(0,0,0,0.2),
    inset 2px 2px 0px 0px ${theme.colors.black},
    4px 0px 0px 0px ${theme.colors.woodDeep},
    -4px 0px 0px 0px ${theme.colors.woodDeep},
    0px -4px 0px 0px ${theme.colors.woodDeep},
    0px 4px 0px 0px ${theme.colors.woodDeep},
    4px 4px 0px 0px ${theme.colors.woodDeep},
    -4px 4px 0px 0px ${theme.colors.woodDeep},
    4px -4px 0px 0px ${theme.colors.woodDeep},
    -4px -4px 0px 0px ${theme.colors.woodDeep}
  `,
});

export const label = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.colors.boardText,
  display: 'block',
  marginBottom: '4px',
});

// 라디오 버튼 그룹
export const radioGroup = style({
  display: 'flex',
  gap: '24px',
  alignItems: 'center',
  padding: '8px 0',
});

export const radioLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '1rem',
  color: theme.colors.boardText,
});

export const checkbox = style({
  width: '20px',
  height: '20px',
  accentColor: theme.colors.primary,
  cursor: 'pointer',
});

// 슬라이더 스타일
export const rangeInput = style({
  width: '100%',
  cursor: 'pointer',
  accentColor: theme.colors.primary,
  marginTop: '8px',
});

export const helpText = style({
  fontSize: '0.85rem',
  color: theme.colors.boardBorder,
  marginTop: '4px',
  display: 'block',
});

// 버튼 그룹
export const buttonGroup = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '16px',
});
