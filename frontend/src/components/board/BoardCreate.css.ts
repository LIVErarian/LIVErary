import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 전체 컨테이너
export const container = style({
  width: '100%',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1rem 0.5rem',
  boxSizing: 'border-box',
});

// 폼 영역 (스크롤 가능)
export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
  flex: 1,
  paddingRight: '0.5rem',
});

// 가로 배치용 (게시판 선택 + 방 선택)
export const row = style({
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'flex-start',
});

export const inputGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: 1,
  overflowY: 'auto',
});

// 라벨 스타일
export const label = style({
  fontSize: '0.95rem',
  color: theme.colors.woodDeep,
  fontWeight: 'bold',
  marginLeft: '4px',
});

// Select 박스 스타일
export const select = style({
  height: '48px',
  padding: '0 12px',
  border: `2px solid ${theme.colors.woodMedium}`,
  backgroundColor: theme.colors.white,
  color: theme.colors.woodDeep,
  fontSize: '1rem',
  fontFamily: 'inherit',
  borderRadius: '4px',
  outline: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  width: '100%',
  boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',

  ':focus': {
    borderColor: theme.colors.woodDeep,
    boxShadow: `2px 2px 0px ${theme.colors.woodDeep}`,
  },
});

export const titleInput = style({
  width: '100%',
  height: '48px',
  padding: '0 12px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: `2px solid ${theme.colors.woodMedium}`,
  borderRadius: '0',
  outline: 'none',
  fontFamily: 'inherit',
  marginBottom: '10px',
  transition: 'border-color 0.2s',

  '::placeholder': {
    fontWeight: 'normal',
  },

  ':focus': {
    borderBottomColor: theme.colors.woodDeep,
  },
});

// 본문 입력 (Textarea)
export const contentArea = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minHeight: '200px',
});

export const textArea = style({
  width: '100%',
  height: '100%',
  padding: '1rem',
  border: `2px solid ${theme.colors.woodMedium}`,
  borderRadius: '4px',
  backgroundColor: theme.colors.white,
  color: theme.colors.woodDeep,
  fontSize: '1rem',
  fontFamily: 'inherit',
  resize: 'none',
  outline: 'none',
  boxSizing: 'border-box',
  lineHeight: '1.6',
  boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.05)',

  ':focus': {
    borderColor: theme.colors.woodDeep,
  },
});

// 하단 버튼 영역
export const footer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.8rem',
  paddingTop: '1rem',
  borderTop: `1px solid ${theme.colors.beigeLight}`,
  marginTop: 'auto',
});
