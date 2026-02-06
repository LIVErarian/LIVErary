import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

/**
 * 개별 책 카드의 전체 컨테이너
 * - hover 시 살짝 위로 올라가는 애니메이션
 */
export const bookCard = style({
  backgroundColor: theme.colors.paper,
  border: `3px solid ${theme.colors.woodDeep}`,
  borderRadius: '8px',
  padding: '12px',

  boxShadow: `
    inset 2px 2px 0px ${theme.colors.beigeLight},
    4px 4px 0px ${theme.colors.woodDeep}
  `,

  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '100%',
  maxWidth: '200px',
  margin: '0 auto',
  height: '360px',
  boxSizing: 'border-box',
  overflow: 'hidden',

  // 애니메이션
  transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
  cursor: 'pointer',
  position: 'relative',

  // hover 효과
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: `
      inset 2px 2px 0px ${theme.colors.beigeLight},
      6px 6px 0px ${theme.colors.woodDeep}
    `,
  },

  selectors: {
    // 도서 선택 모달 내의 3열 그리드에서만 카드를 컴팩트하게 축소
    '[class*="selectionSearchGrid"] &': {
      height: '220px !important',
      padding: '8px !important',
      gap: '4px !important',
    },
  },
});

/**
 * 책 표지 이미지 래퍼 (이미지 처리 실패 -> 영역 유지)
 */
export const coverWrapper = style({
  width: '100%',
  height: '240px',
  flexShrink: 0, // 크기 줄어들지 않도록
  backgroundColor: theme.colors.beigeLight,
  border: `2px solid ${theme.colors.beigeDark}`,
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',

  boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)',

  selectors: {
    // 도서 선택 모달 내의 표지 크기 축소
    '[class*="selectionSearchGrid"] &': {
      height: '140px !important',
    },
  },
});

/**
 * 책 표지 이미지
 */
export const coverImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover', // 비율 유지 & 영역 채우기
  objectPosition: 'center', // 중앙에서 잘라내기
  display: 'block',
});

/**
 * 이미지 로딩 실패 시
 */
export const coverPlaceholder = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  color: theme.colors.beigeDark,
});

/**
 * 책 정보(제목, 저자 등)를 담는 컨테이너
 */
export const bookInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minHeight: '80px', // 최소 높이 고정 (제목 2줄 + 저자 + 출판사)
  overflow: 'hidden', // 넘치는 콘텐츠 숨김
});

/**
 * 책 제목 스타일
 * - 최대 2줄까지만 표시 (말줄임)
 */
export const bookTitle = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  lineHeight: '1.4',

  // 2줄 말줄임 처리
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-all', // 긴 단어 줄바꿈
});

/**
 * 저자/출판사 정보 스타일
 */
export const bookMeta = style({
  fontSize: '0.7rem',
  color: theme.colors.beigeText,
  lineHeight: '1.2',

  // 1줄 말줄임
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/**
 * 완독한 책 카드 스타일
 */
export const completedCard = style({
  opacity: 0.7,

  ':hover': {
    opacity: 0.85,
  },
});

/**
 * 읽는 중 배지 (책 표지 상단 오버레이)
 */
export const readingBadge = style({
  position: 'absolute',
  top: '8px',
  left: '50%',
  transform: 'translateX(-50%)',

  padding: '4px 12px',
  fontSize: '0.75rem',
  fontWeight: 'bold',

  backgroundColor: theme.colors.warning,
  color: theme.colors.white,
  border: `2px solid ${theme.colors.woodDeep}`,
  borderRadius: '6px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',

  zIndex: 5,
  whiteSpace: 'nowrap',
});

/**
 * 완독 도장 스타일 (책 표지 중앙 오버레이)
 */
export const completedStamp = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  width: '80px',
  height: '80px',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  fontSize: '1.2rem',
  fontWeight: 'bold',
  lineHeight: '1.2',
  textAlign: 'center',

  color: theme.colors.white,
  backgroundColor: 'rgba(34, 139, 34, 0.85)',
  border: `4px solid ${theme.colors.success}`,
  borderRadius: '50%', // 원형 도장

  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
  zIndex: 4,

  rotate: '-15deg', // 회전 효과
});

/**
 * 찜 하트 버튼 (책 표지 하단에 겹침)
 */
export const heartOverlayWrapper = style({
  position: 'absolute',
  bottom: '8px',
  right: '8px',

  width: '30px',
  height: '30px',

  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',

  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  transition: 'transform 0.1s ease-in-out',
  zIndex: 5,

  ':hover': {
    transform: 'translate(-1px, -1px) scale(1.1)',
  },

  ':active': {
    transform: 'translate(1px, 1px) scale(0.95)',
  },
});

/**
 * 찜 버튼 (픽셀 하트)
 */
export const pixelHeart = style({
  width: '3px',
  height: '3px',
  backgroundColor: '#e74c3c',

  // 픽셀 아트 하트 모양 (16x14 픽셀)
  boxShadow: `
    /* 1행 */
    3px 0px 0 #e74c3c, 6px 0px 0 #e74c3c, 9px 0px 0 #e74c3c,
    15px 0px 0 #e74c3c, 18px 0px 0 #e74c3c, 21px 0px 0 #e74c3c,
    
    /* 2행 */
    0px 3px 0 #e74c3c, 3px 3px 0 #c0392b, 6px 3px 0 #e74c3c, 9px 3px 0 #e74c3c, 12px 3px 0 #e74c3c,
    15px 3px 0 #e74c3c, 18px 3px 0 #c0392b, 21px 3px 0 #e74c3c, 24px 3px 0 #e74c3c,
    
    /* 3행 */
    0px 6px 0 #e74c3c, 3px 6px 0 #c0392b, 6px 6px 0 #e74c3c, 9px 6px 0 #e74c3c, 12px 6px 0 #e74c3c,
    15px 6px 0 #e74c3c, 18px 6px 0 #e74c3c, 21px 6px 0 #c0392b, 24px 6px 0 #e74c3c,
    
    /* 4행 */
    0px 9px 0 #e74c3c, 3px 9px 0 #e74c3c, 6px 9px 0 #e74c3c, 9px 9px 0 #e74c3c, 12px 9px 0 #e74c3c,
    15px 9px 0 #e74c3c, 18px 9px 0 #e74c3c, 21px 9px 0 #e74c3c, 24px 9px 0 #e74c3c,
    
    /* 5행 */
    3px 12px 0 #e74c3c, 6px 12px 0 #e74c3c, 9px 12px 0 #e74c3c, 12px 12px 0 #e74c3c,
    15px 12px 0 #e74c3c, 18px 12px 0 #e74c3c, 21px 12px 0 #e74c3c,
    
    /* 6행 */
    6px 15px 0 #e74c3c, 9px 15px 0 #e74c3c, 12px 15px 0 #e74c3c, 15px 15px 0 #e74c3c, 18px 15px 0 #e74c3c,
    
    /* 7행 */
    9px 18px 0 #e74c3c, 12px 18px 0 #e74c3c, 15px 18px 0 #e74c3c,
    
    /* 8행 (맨 아래) */
    12px 21px 0 #e74c3c
  `,

  marginLeft: '-12px',
  marginTop: '-10px',
});

/**
 * 완독하기 버튼 오버레이 (읽는 중 상태에서 호버 시 표시)
 */
export const completeOverlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // 반투명 배경
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  zIndex: 10,
  borderRadius: '4px', // coverWrapper와 동일하게

  selectors: {
    [`${coverWrapper}:hover &`]: {
      opacity: 1,
    },
  },
});

/**
 * 완독 완료 버튼
 */
export const completeButton = style({
  padding: '8px 16px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  backgroundColor: theme.colors.beigeLight,
  border: `2px solid ${theme.colors.woodDeep}`,
  borderRadius: '4px',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.1s, background-color 0.1s',

  ':hover': {
    transform: 'scale(1.05)',
    backgroundColor: theme.colors.white,
  },

  ':active': {
    transform: 'scale(0.95)',
  },
});
