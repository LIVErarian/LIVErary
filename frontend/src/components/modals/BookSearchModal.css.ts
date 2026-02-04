import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 전체 모달 컨테이너
export const modalContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  padding: '0',
});

// 검색창 컨테이너
export const searchContainer = style({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  width: '100%',
  marginBottom: '0.5rem',
});

export const searchInput = style({
  flex: 1,
  height: '40px',
  fontSize: '0.95rem',
});

export const searchButton = style({
  minWidth: '80px',
  height: '40px',
});

// 검색 결과 컨텐츠 영역 (스크롤 영역)
export const contentArea = style({
  width: '100%',
  height: '500px',
  overflowY: 'auto',
  paddingRight: '8px',
  boxSizing: 'border-box',

  backgroundColor: theme.colors.paper,
  border: `1px solid ${theme.colors.beigeLight}`,
  borderRadius: '8px',
  padding: '16px',

  '::-webkit-scrollbar': {
    width: '12px',
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

/**
 * 책 카드 그리드 레이아웃
 */
//
export const booksGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)', // 한 줄 3열(3권) 고정
  gap: '16px',
  padding: '4px',
});

/**
 * 로딩 상태 표시
 */
export const loadingContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: theme.colors.boardText,
});

/**
 * 빈 상태 메시지
 * - 검색 전 / 검색 결과 없음
 */
export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  width: '100%',
  height: '100%',
  color: theme.colors.beigeText,
  textAlign: 'center',
});

export const emptyIcon = style({
  fontSize: '4rem',
  opacity: 0.5,
});

export const emptyText = style({
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: theme.colors.boardText,
});

/**
 * 페이지네이션 컨테이너
 * - 하단 중앙 정렬
 */
export const paginationContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  paddingTop: '16px',
  borderTop: `2px solid ${theme.colors.beigeMain}`,
});

/**
 * 페이지 번호 텍스트
 * - 현재 페이지 / 총 페이지 표시
 */
export const pageInfo = style({
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: theme.colors.boardText,
  padding: '0 12px',
  minWidth: '100px',
  textAlign: 'center',
});
