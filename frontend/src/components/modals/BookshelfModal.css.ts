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
