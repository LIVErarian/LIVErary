import { style } from '@vanilla-extract/css';

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
 * 도서 선택 모달 전용 3열 그리드 (고정 너비, 세로 스케일 최적화)
 */
export const selectionSearchGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
  padding: '4px',
  width: '100%',
});

/**
 * 모달 전체 컨테이너
 */
export const modalContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  height: '100%',
  padding: '8px',
  boxSizing: 'border-box',
});

/**
 * 검색 영역 (입력창 + 버튼)
 */
export const searchContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  paddingBottom: '16px',
  borderBottom: `2px solid ${theme.colors.beigeMain}`,
});

/**
 * 검색 입력창
 */
export const searchInput = style({
  flex: 1, // 남은 공간 채우기
  height: '48px', // 버튼 높이와 맞춤
});

/**
 * 검색 버튼
 */
export const searchButton = style({
  height: '48px', // 높이 고정
  minWidth: '80px',
  fontSize: '1rem',
});
