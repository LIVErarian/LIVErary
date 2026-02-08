import { globalStyle, style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

/**
 * 모달 전체 컨테이너
 * - 사용자의 요청대로 520px 고정
 */
export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  height: '520px',
  boxSizing: 'border-box',
  overflow: 'hidden',
  padding: '4px',
});

export const description = style({
  fontSize: '0.9rem',
  color: theme.colors.boardText,
  textAlign: 'center',
});

export const completionCheck = style({
  padding: '8px 12px',
  backgroundColor: theme.colors.beigeLight,
  borderRadius: '8px',
  marginTop: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.85rem',
});

// 책 변경 시 현재 읽는 책 표시 영역
export const currentBookSection = style({
  padding: '8px 16px',
  backgroundColor: theme.colors.beigeLight,
  borderRadius: '12px',
  border: `2px solid ${theme.colors.woodMedium}`,
  marginBottom: '4px',
});

export const sectionLabel = style({
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: theme.colors.beigeText,
  marginBottom: '2px',
  display: 'block',
});

export const currentBookInfo = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
});

export const currentBookCover = style({
  width: '32px',
  height: '45px',
  objectFit: 'cover',
  borderRadius: '4px',
});

export const currentBookDetails = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
});

export const currentBookTitle = style({
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});

export const currentBookAuthor = style({
  fontSize: '0.75rem',
  color: theme.colors.beigeText,
});

// 도서 목록 스크롤 영역 (목록 뷰)
export const bookList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1,
  overflowY: 'auto',
  paddingRight: '8px',
  minHeight: 0,
});

export const emptyState = style({
  padding: '40px',
  textAlign: 'center',
  color: theme.colors.beigeText,
});

export const addBookButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px',
  border: `2px dashed ${theme.colors.woodMedium}`,
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  backgroundColor: theme.colors.beigeLight,
  marginBottom: '0',
  transition: 'all 0.1s ease-in-out',

  ':hover': {
    backgroundColor: theme.colors.beigeMain,
    borderColor: theme.colors.woodDeep,
    transform: 'translateY(-1px)',
  },
});

export const addIcon = style({
  fontSize: '1.1rem',
  fontWeight: 'bold',
});

export const bookItem = style({
  display: 'flex',
  gap: '16px', // 이미지와 텍스트 간격 확대
  padding: '12px 16px', // 패딩 확대
  border: `2px solid ${theme.colors.beigeMain}`,
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.1s',
  minHeight: '100px', // 이미지 크기에 맞춰 최소 높이 확대
  height: 'auto',
  boxSizing: 'border-box',

  ':hover': {
    backgroundColor: theme.colors.beigeLight,
    transform: 'translateX(2px)',
  },
});

export const bookItemSelected = style({
  backgroundColor: theme.colors.beigeLight,
  borderColor: theme.colors.woodDeep,
});

export const bookCover = style({
  width: '56px', // 이미지 크기 확대
  height: '80px',
  objectFit: 'cover',
  borderRadius: '4px',
  flexShrink: 0,
});

export const bookInfo = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  justifyContent: 'center',
});

export const bookTitle = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  lineHeight: '1.2',
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
});

export const bookAuthor = style({
  fontSize: '0.85rem',
  color: theme.colors.beigeText,
});

export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '8px',
  paddingTop: '8px',
  borderTop: 'none !important',
});

/**
 * 검색 뷰 전용 컨테이너
 */
export const searchViewContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1,
  height: '100%',
  overflow: 'hidden',
  minHeight: 0,
});

// BookSearchModal 내부 스타일 강제 조정
globalStyle(`${searchViewContainer} [class*="contentArea"]`, {
  flex: '1 !important',
  height: 'auto !important',
  minHeight: 0,
  overflow: 'hidden',
  marginBottom: '8px !important',
  borderRadius: '12px',
  border: `2px solid ${theme.colors.beigeMain}`,
  display: 'flex !important',
  flexDirection: 'column',
  padding: '8px !important',
  boxSizing: 'border-box',
});

// 검색 안내 문구 상하좌우 정중앙 배치
globalStyle(`${searchViewContainer} [class*="emptyState"]`, {
  flex: '1 !important',
  display: 'flex !important',
  flexDirection: 'column',
  alignItems: 'center !important',
  justifyContent: 'center !important',
  height: '100% !important',
  width: '100% !important',
  margin: '0 !important',
});

// 검색 결과 그리드가 보일 때 내부 스크롤 허용
globalStyle(
  `${searchViewContainer} [class*="contentArea"]:has([class*="Grid"])`,
  {
    overflowY: 'auto',
  },
);

// 모달 내부 레이아웃이 깨지지 않도록 강제 조정
globalStyle(`${searchViewContainer} [class*="modalContainer"]`, {
  padding: '0 !important',
  gap: '4px !important',
  height: '100% !important',
  display: 'flex !important',
  flexDirection: 'column',
  overflow: 'hidden !important',
});

// 페이지네이션 버튼 가시성 확보
globalStyle(`${searchViewContainer} [class*="paginationContainer"]`, {
  paddingTop: '0 !important',
  marginTop: '0 !important',
  backgroundColor: 'transparent !important',
  borderTop: 'none !important',
  height: '35px !important',
  display: 'flex !important',
  alignItems: 'center !important',
  flexShrink: 0,
});

export const searchHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingBottom: '4px',
  borderBottom: `1px solid ${theme.colors.beigeMain}`,
});

export const searchTitle = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});
