import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

/**
 * 전체 모달 컨테이너
 */
export const modalContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  backgroundColor: theme.colors.paper,
  border: `4px solid ${theme.colors.woodDeep}`,
  borderRadius: '12px',
  padding: '24px',
  width: '800px',
  maxWidth: '90vw',
  maxHeight: '80vh', // 화면의 80% 높이로 제한
  boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden', // 스크롤
});

/**
 * 탭 버튼 컨테이너
 * - 찜한 책 / 읽은 책 탭 전환
 */
export const tabContainer = style({
  display: 'flex',
  gap: '8px',
  borderBottom: `3px solid ${theme.colors.beigeMain}`,
  paddingBottom: '8px',
});

/**
 * 개별 탭 버튼
 */
export const tabButton = style({
  flex: 1,
  padding: '12px 20px',
  fontSize: '1rem',
  fontWeight: 'bold',
  fontFamily: 'inherit',
  border: `3px solid ${theme.colors.woodDeep}`,
  borderRadius: '8px 8px 0 0',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',

  // 기본 상태: 비활성 탭
  backgroundColor: theme.colors.beigeMain,
  color: theme.colors.beigeText,
  boxShadow: `
    inset 2px 2px 0px ${theme.colors.beigeLight},
    inset -2px -2px 0px ${theme.colors.beigeDark}
  `,

  ':hover': {
    backgroundColor: theme.colors.beigeLight,
    transform: 'translateY(-2px)',
  },
});

/**
 * 활성 탭 스타일
 */
export const tabActive = style({
  backgroundColor: theme.colors.woodMedium,
  color: theme.colors.white,
  boxShadow: `
    inset 2px 2px 0px ${theme.colors.woodLight},
    inset -2px -2px 0px ${theme.colors.woodDark}
  `,
  borderBottom: 'none',

  ':hover': {
    backgroundColor: theme.colors.woodMedium,
    transform: 'none',
  },
});

/**
 * 책 목록 컨텐츠 영역 (스크롤 영역)
 */
export const contentArea = style({
  height: '500px', // 고정 높이
  overflowY: 'auto', // 세로 스크롤
  paddingRight: '8px',

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
  padding: '60px 20px',
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
  padding: '60px 20px',
  fontSize: '2rem',
});
