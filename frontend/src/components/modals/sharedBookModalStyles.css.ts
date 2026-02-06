import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

/**
 * 책 목록/검색 결과 컨텐츠 영역 (스크롤 영역)
 */
export const contentArea = style({
  width: '100%',
  height: '500px', // 고정 높이
  overflowY: 'auto', // 세로 스크롤
  paddingRight: '8px',
  boxSizing: 'border-box',

  // paper 스타일
  backgroundColor: theme.colors.paper,
  border: `1px solid ${theme.colors.beigeLight}`,
  borderRadius: '8px',
  padding: '16px',

  // 스크롤바
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
 * 책 카드 그리드 레이아웃 (4열)
 */
export const booksGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)', // 한 줄 3열(3권) 고정
  gridAutoRows: '1fr', // 모든 행 높이 균일하게
  gap: '24px 16px', // 세로 24px, 가로 16px 간격
  padding: '4px',
});

/**
 * 빈 상태 메시지 컨테이너
 */
export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  width: '100%',
  flex: 1, // 남은 공간 채우기
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
 * 로딩 컨테이너
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

/**
 * 닫기 버튼 (모든 모달 공통)
 */
export const closeButton = style({
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '32px',
  height: '32px',
  border: `2px solid ${theme.colors.woodDeep}`,
  backgroundColor: theme.colors.beigeMain,
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  transition: 'all 0.1s ease-in-out',

  ':hover': {
    backgroundColor: theme.colors.beigeDark,
    transform: 'translate(-1px, -1px)',
    boxShadow: `2px 2px 0px ${theme.colors.woodDeep}`,
  },

  ':active': {
    transform: 'translate(1px, 1px)',
    boxShadow: 'none',
  },
});
