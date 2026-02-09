import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

/**
 * 전체 모달 컨테이너
 */
export const modalContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
  height: '100%',
  maxHeight: '80vh',
  boxSizing: 'border-box',
  padding: '0.5rem',
});

/**
 * 탭 버튼 컨테이너
 */
export const tabContainer = style({
  display: 'flex',
  gap: '8px',
  width: '100%',
  marginBottom: '0.5rem',
  alignItems: 'center',
});

/**
 * 개별 탭 버튼
 */
export const tabButton = style({
  flex: 1,
  height: '40px',
  transition: 'all 0.2s',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: theme.colors.beigeLight,
  color: theme.colors.beigeText,
  fontFamily: 'inherit',
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: 'pointer',
  opacity: 0.8,

  selectors: {
    '&:hover': {
      opacity: 1,
    },
  },
});

/**
 * 활성 탭 스타일
 */
export const tabActive = style({
  backgroundColor: theme.colors.primary,
  color: theme.colors.white,
  opacity: 1,
});

export {
  booksGrid,
  contentArea,
  emptyIcon,
  emptyState,
  emptyText,
  loadingContainer,
  pageInfo,
  paginationContainer,
} from './sharedBookModalStyles.css';

/**
 * 로딩 상태 컨테이너
 */
export const loadingState = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontSize: '2rem',
  color: theme.colors.beigeText,
});

/**
 * 검색 뷰 컨테이너
 */
export const searchViewContainer = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  gap: '1rem',
});

/**
 * 검색 뷰 헤더
 */
export const searchHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});

/**
 * 책 추가 버튼 (빈 상태용 - 큰 버튼)
 */
export const addBookButton = style({
  marginTop: '1rem',
  padding: '0.8rem 1.5rem',
  fontSize: '1.2rem',
});

/**
 * 책 목록 래퍼
 */
export const bookListWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  gap: '0.5rem',
});

/**
 * 툴바 (작은 추가 버튼 등 위쪽)
 */
export const toolbar = style({
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
  marginBottom: '0.5rem',
});

/**
 * 작은 추가 버튼
 */
export const addButtonSmall = style({
  fontSize: '0.8rem',
  padding: '0.4rem 0.8rem',
});
