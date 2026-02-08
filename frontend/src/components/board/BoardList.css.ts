import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 전체 컨테이너
export const container = style({
  width: '100%',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxSizing: 'border-box',
  padding: '0.5rem 1.5rem',
});

export const toolbar = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '10px',
  gap: '10px',
});

// 검색 그룹
export const searchGroup = style({
  display: 'flex',
  gap: '4px',
  alignItems: 'flex-end',
});

// Input이 찌그러지지 않도록 영역 확보 (Reference의 checkInput 참고)
export const searchInputWrapper = style({
  width: '200px',
});

// 상단 헤더 (탭 버튼)
export const header = style({
  display: 'flex',
  width: '100%',
  gap: '4px',
  marginBottom: '0.5rem',
});

// 탭 버튼 기본 스타일
export const tabButton = style({
  flex: 1,
  height: '40px',
  transition: 'all 0.2s',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: theme.colors.beigeLight,
  color: theme.colors.beigeText,
  opacity: 0.8,
});

// 활성화된 탭 버튼 스타일
export const activeTab = style({
  backgroundColor: theme.colors.primary,
  color: theme.colors.white,
  opacity: 1,
});

// 게시판 리스트 영역 (테이블)
export const tableContainer = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.paper,
  borderRadius: '8px',
  border: `1px solid ${theme.colors.beigeLight}`,
  flex: 1,
  padding: '0.3rem 0',
});

// 테이블 행 (리스트 아이템)
export const tableRow = style({
  display: 'grid',
  gridTemplateColumns: '1.5fr 7fr 2fr 2fr',
  padding: '0.8rem 0.8rem',
  borderBottom: `1px solid ${theme.colors.beigeLight}`,
  cursor: 'pointer',
  alignItems: 'center',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: theme.colors.beigeLight,
  },
  ':last-child': {
    borderBottom: 'none',
  },
});

export const textCategory = style({
  textAlign: 'center',
  color: theme.colors.primary,
  fontWeight: 'bold',
  fontSize: '0.9rem',
});

export const textTitle = style({
  fontWeight: 'bold',
  paddingLeft: '10px',
  color: theme.colors.woodDeep,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '1.05rem',
});

export const textAuthor = style({
  textAlign: 'center',
  color: theme.colors.beigeText,
  fontWeight: '500',
  fontSize: '0.95rem',
});

export const textDate = style({
  textAlign: 'center',
  fontSize: '0.9rem',
  color: theme.colors.beigeDark,
});

export const emptyState = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  minHeight: '220px',
  flex: 1,
  color: theme.colors.disabledText,
  fontSize: '1.2rem',
  fontWeight: 'bold',
});

export const pagination = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  marginTop: 'auto',
  paddingTop: '0.5rem',
});

export const pageNumber = style({
  fontFamily: 'monospace',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.colors.black,
});
