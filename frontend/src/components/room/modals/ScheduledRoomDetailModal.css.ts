import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 모달 내부 컨테이너
export const container = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '1rem',
  boxSizing: 'border-box',
});

// 로딩 메시지
export const loadingMessage = style({
  textAlign: 'center',
  padding: '2rem',
});

// 핵심: 방 정보 카드 (책 표지 + 정보)
export const roomInfoCard = style({
  display: 'flex',
  gap: '1.5rem',
  padding: '1.5rem',
  backgroundColor: theme.colors.white,
  borderRadius: '12px',
  border: `2px solid ${theme.colors.woodMedium}`,
  boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
  alignItems: 'flex-start',
});

// 책 표지 이미지
export const bookCover = style({
  width: '120px',
  height: '170px',
  objectFit: 'cover',
  borderRadius: '4px',
  border: `1px solid ${theme.colors.beigeDark}`,
  backgroundColor: theme.colors.beigeLight,
  flexShrink: 0,
});

// 오른쪽 텍스트 정보 영역
export const infoSection = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
});

// 방 제목
export const roomTitle = style({
  fontSize: '1.4rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  marginBottom: '0.2rem',
  lineHeight: '1.3',
});

// 책 제목 & 저자
export const bookInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  paddingBottom: '0.8rem',
  borderBottom: `1px dashed ${theme.colors.woodLight}`,
});

export const bookTitleText = style({
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: theme.colors.black,
});

export const bookAuthorText = style({
  fontSize: '0.95rem',
  color: theme.colors.woodMedium,
});

// 상세 정보 행
export const detailRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.95rem',
  color: theme.colors.boardText,
});

export const label = style({
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  minWidth: '60px',
});

// 버튼 영역
export const footer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '0.5rem',
});

// 방장 버튼 그룹
export const hostButtonGroup = style({
  display: 'flex',
  gap: '10px',
});
