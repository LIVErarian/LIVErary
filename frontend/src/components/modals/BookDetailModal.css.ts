import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

/**
 * 모달 오버레이 (배경)
 */
export const modalOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '20px',
});

/**
 * 모달 컨테이너
 */
export const modalContainer = style({
  backgroundColor: theme.colors.paper,
  border: `4px solid ${theme.colors.woodDeep}`,
  borderRadius: '12px',
  boxShadow: `
    inset 3px 3px 0px ${theme.colors.beigeLight},
    8px 8px 0px ${theme.colors.woodDeep}
  `,
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
  padding: '32px',
});

/**
 * 콘텐츠 영역
 */
export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '16px',
});

/**
 * 상단 영역 (표지 + 기본 정보)
 */
export const topSection = style({
  display: 'flex',
  gap: '24px',
  '@media': {
    '(max-width: 500px)': {
      flexDirection: 'column',
    },
  },
});

/**
 * 책 표지 이미지
 */
export const coverImage = style({
  width: '180px',
  height: '240px',
  objectFit: 'cover',
  border: `3px solid ${theme.colors.woodDeep}`,
  borderRadius: '8px',
  flexShrink: 0,
  boxShadow: `4px 4px 0px ${theme.colors.woodDeep}`,
});

/**
 * 책 정보 영역
 */
export const bookInfo = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

/**
 * 책 제목
 */
export const title = style({
  fontSize: '24px',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  lineHeight: 1.3,
  marginBottom: '8px',
});

/**
 * 정보 라인
 */
export const infoLine = style({
  fontSize: '14px',
  color: theme.colors.woodMedium,
  display: 'flex',
  gap: '8px',
  alignItems: 'baseline',
});

/**
 * 라벨
 */
export const label = style({
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  minWidth: '60px',
});

/**
 * 값
 */
export const value = style({
  flex: 1,
});

/**
 * 구분선
 */
export const divider = style({
  height: '2px',
  backgroundColor: theme.colors.beigeDark,
  margin: '8px 0',
});

/**
 * 찜하기 버튼 컨테이너 (경계선 위 오른쪽)
 */
export const wishButtonContainer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingTop: '8px',
  paddingBottom: '8px',
  paddingRight: '20px', // 하트를 20px 왼쪽으로
});

/**
 * 책 소개 섹션
 */
export const descriptionSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

/**
 * 섹션 제목
 */
export const sectionTitle = style({
  fontSize: '18px',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});

/**
 * 책 소개 내용
 */
export const description = style({
  fontSize: '14px',
  lineHeight: 1.8,
  color: theme.colors.woodMedium,
  whiteSpace: 'pre-wrap',
  wordBreak: 'keep-all',
});

/**
 * 구매 버튼
 */
export const purchaseButton = style({
  width: '100%',
  padding: '16px',
  backgroundColor: theme.colors.woodDeep,
  color: theme.colors.paper,
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.1s ease-in-out',
  marginTop: '8px',

  ':hover': {
    backgroundColor: theme.colors.woodMedium,
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 8px rgba(0, 0, 0, 0.2)`,
  },

  ':active': {
    transform: 'translateY(0)',
    boxShadow: 'none',
  },
});

/**
 * 로딩/에러 상태
 */
export const centerMessage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '300px',
  fontSize: '16px',
  color: theme.colors.woodMedium,
});
