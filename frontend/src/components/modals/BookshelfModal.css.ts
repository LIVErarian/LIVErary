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

/**
 * 책 목록 컨텐츠 영역 (스크롤 영역)
 */
export const contentArea = style({
  width: '100%',
  height: '500px', // 고정 높이
  overflowY: 'auto', // 세로 스크롤
  paddingRight: '8px',
  boxSizing: 'border-box',

  // Paper 스타일 적용
  backgroundColor: theme.colors.paper,
  border: `1px solid ${theme.colors.beigeLight}`,
  borderRadius: '8px',
  padding: '16px',

  // 커스텀 스크롤바
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
export const booksGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)', // 한 줄 4열(4권) 고정
  gap: '16px',
  padding: '4px',
});

/**
 * 빈 상태 메시지
 * - 책이 없을 때 표시
 */
export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  width: '100%',
  height: '100%', // 부모(contentArea) 높이 가득 채우기
  // padding: '60px 20px', // 중앙 정렬이므로 padding 불필요할 수 있음, 필요하면 유지
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

/**
 * 로딩 스피너 컨테이너
 * - API 연동 시 사용
 */
export const loadingContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontSize: '2rem',
  color: theme.colors.beigeText,
});
