import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 회원증 전체 컨테이너
export const cardContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  backgroundColor: theme.colors.paper,
  border: `4px solid ${theme.colors.woodDeep}`,
  borderRadius: '12px',
  padding: '24px 32px',
  width: '500px',
  maxWidth: '90vw',
  boxShadow: '8px 8px 0px rgba(0,0,0,0.3)',
  cursor: 'default',
  position: 'relative',
});

export const cardHeader = style({
  textAlign: 'center',
  fontSize: '1.5rem',
  fontWeight: '900',
  color: theme.colors.woodDeep,
  letterSpacing: '2px',
  borderBottom: `2px solid ${theme.colors.woodLight}`,
  paddingBottom: '12px',
  marginBottom: '8px',
  fontFamily: 'inherit',
  textTransform: 'uppercase',
});

// 내용 영역
export const contentContainer = style({
  display: 'flex',
  flexDirection: 'row',
  gap: '24px',
  alignItems: 'flex-start',
});

// 사진 영역
export const photoArea = style({
  width: '110px',
  height: '140px',
  backgroundColor: theme.colors.beigeLight,
  border: `2px dashed ${theme.colors.beigeDark}`,
  borderRadius: '4px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.8rem',
  color: theme.colors.beigeText,
  flexShrink: 0,
  boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)',
});

// 회원 정보 영역
export const infoArea = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '140px',
});

// 닉네임
export const nicknameRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '10px',
  height: '40px',
});

export const nicknameText = style({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  textDecoration: 'underline',
  textDecorationColor: theme.colors.beigeMain,
  textUnderlineOffset: '4px',
});

// 카테고리
export const categoryRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  marginBottom: '8px',
  fontSize: '0.8rem',
  color: theme.colors.boardText,
});

// 독서 시간 섹션
export const timeSection = style({
  fontSize: '0.9rem',
  color: theme.colors.boardText,
  backgroundColor: theme.colors.beigeLight,
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'inline-block',
  marginBottom: '16px',
  width: 'fit-content',
  border: `1px solid ${theme.colors.beigeDark}`,
});

// 통계 카운트 영역
export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
  borderTop: `2px solid ${theme.colors.beigeMain}`,
  paddingTop: '12px',
});

export const statItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
});

export const statLabel = style({
  fontSize: '0.7rem',
  color: theme.colors.beigeText,
  textTransform: 'uppercase',
});

export const statValue = style({
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});

// 하단 바코드 스타일
export const barcode = style({
  textAlign: 'center',
  marginTop: '8px',
  opacity: 0.6,
  letterSpacing: '4px',
  fontSize: '1rem',
  color: theme.colors.woodDeep,
  userSelect: 'none',
});
