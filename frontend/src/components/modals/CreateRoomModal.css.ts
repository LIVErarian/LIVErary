import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 모달 전체 컨테이너
export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxHeight: '80vh', // 높이 제한
  overflow: 'hidden',
  padding: '4px',
});

// 스크롤 본문
export const scrollContent = style({
  flex: 1,
  overflowY: 'auto',
  padding: '4px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

// 가로 배치 그리드
export const rowGroup = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  alignItems: 'end',
});

export const requiredMark = style({
  color: theme.colors.primary,
  marginLeft: '4px',
  fontWeight: 'bold',
});

export const label = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.colors.boardText,
  display: 'block',
  marginBottom: '8px',
});

// 공통 인풋 스타일
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
  appearance: 'none',
  cursor: 'pointer',
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

export const radioGroup = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  height: '48px',
});

export const radioLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  color: theme.colors.boardText,
});

export const checkbox = style({
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  accentColor: theme.colors.primary,
});

export const stepperContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '4px',
  height: '48px',
  backgroundColor: theme.colors.inputBg,
  padding: '0 4px',
  boxShadow: `inset 2px 2px 0px 0px rgba(0,0,0,0.2)`,
});

export const stepperInput = style({
  width: '50px',
  height: '100%',
  textAlign: 'center',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.colors.inputText,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  // 스핀 버튼(화살표) 숨기기
  '::-webkit-inner-spin-button': {
    appearance: 'none',
    margin: 0,
  },
  '::-webkit-outer-spin-button': {
    appearance: 'none',
    margin: 0,
  },
});

export const dateTimeRow = style({
  display: 'flex',
  gap: '8px',
  width: '100%',
});

export const dateInput = style([
  pixelSelect,
  {
    flex: 1.5,
    padding: '0 8px',
    fontSize: '0.9rem',
  },
]);

export const timeSelect = style([
  pixelSelect,
  {
    flex: 1,
    padding: '0 8px',
  },
]);

export const bookSelectContainer = style({
  position: 'relative',
  width: '100%',
});

export const searchResultsDropdown = style({
  position: 'absolute',
  top: '100%',
  left: 0,
  width: '100%',
  maxHeight: '180px',
  overflowY: 'auto',
  backgroundColor: theme.colors.inputBg,
  color: theme.colors.inputText,
  border: `2px solid ${theme.colors.woodDeep}`,
  borderRadius: '0 0 8px 8px',
  zIndex: 100,
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  marginTop: '4px',
});

export const searchResultItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  cursor: 'pointer',
  borderBottom: `1px solid ${theme.colors.beigeLight}`,
  selectors: {
    '&:hover': {
      backgroundColor: theme.colors.paper,
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const dropdownMessage = style({
  padding: '12px',
  color: theme.colors.woodMedium,
  textAlign: 'center',
  fontSize: '0.9rem',
});

export const bookThumbnail = style({
  width: '30px',
  height: '45px',
  objectFit: 'cover',
  border: `1px solid ${theme.colors.beigeLight}`,
  flexShrink: 0,
});

export const searchResultInfo = style({
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const searchResultTitle = style({
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: theme.colors.black,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const searchResultAuthor = style({
  fontSize: '0.75rem',
  color: theme.colors.woodMedium,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const selectedBookCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: theme.colors.paper,
  border: `2px solid ${theme.colors.woodDeep}`,
  borderRadius: '8px',
  width: '100%',
  boxSizing: 'border-box',
});

export const bookCover = style({
  width: '40px',
  height: '60px',
  objectFit: 'cover',
  backgroundColor: '#ddd',
  border: `1px solid ${theme.colors.black}`,
  flexShrink: 0,
});

export const bookInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
  overflow: 'hidden',
  minWidth: 0,
});

export const bookTitle = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const removeBookBtn = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.5rem',
  color: theme.colors.primary,
  padding: '0 8px',
  flexShrink: 0,
});

export const helpText = style({
  fontSize: '0.85rem',
  color: theme.colors.woodMedium,
  marginTop: '4px',
  marginBottom: '6px',
  display: 'block',
});

export const buttonGroup = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: `2px dashed ${theme.colors.beigeLight}`,
});
