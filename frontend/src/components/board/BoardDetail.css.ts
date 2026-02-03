import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  width: '800px',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.8rem 2.5rem',
  boxSizing: 'border-box',
  backgroundColor: theme.colors.paper,
  borderRadius: '8px',
  alignItems: 'center',
});

export const header = style({
  width: '100%',
  paddingBottom: '1rem',
  borderBottom: `2px solid ${theme.colors.beigeLight}`,
});

export const title = style({
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  marginBottom: '0.5rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const meta = style({
  fontSize: '0.9rem',
  color: theme.colors.beigeText,
  display: 'flex',
  gap: '1rem',
});

export const content = style({
  flex: 1,
  width: '100%',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.7',
  color: theme.colors.boardText,
  overflowY: 'auto',
});

// 책 정보가 있을 때 (2단 레이아웃)
export const roomInfoCard = style({
  display: 'grid',
  gridTemplateColumns: '150px 1fr',
  gap: '1.5rem',
  padding: '1.5rem',
  backgroundColor: theme.colors.white,
  border: `1px solid ${theme.colors.beigeLight}`,
  borderRadius: '8px',
  alignItems: 'start',
});

// 책 정보가 없을 때 (1단 레이아웃)
export const roomInfoCardNoBook = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.5rem',
  backgroundColor: theme.colors.white,
  border: `1px solid ${theme.colors.beigeLight}`,
  borderRadius: '8px',
});

export const bookCoverSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  width: '100%',
});

export const bookCover = style({
  width: '100%',
  height: 'auto',
  objectFit: 'cover',
  boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.15)',
  borderRadius: '4px',
  border: `1px solid ${theme.colors.beigeDark}`,
});

export const roomDetailsSection = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const roomTitle = style({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: theme.colors.primary,
});

export const roomMeta = style({
  display: 'flex',
  gap: '1rem',
  fontSize: '0.9rem',
  color: theme.colors.beigeText,
  alignItems: 'center',
});

export const tag = style({
  backgroundColor: theme.colors.beigeLight,
  color: theme.colors.beigeText,
  padding: '0.2rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
});

export const bookInfo = style({
  fontSize: '1rem',
  lineHeight: '1.2',
});

export const footer = style({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
  paddingTop: '1rem',
  borderTop: `1px solid ${theme.colors.beigeLight}`,
});

export const actionButtons = style({
  display: 'flex',
  gap: '0.5rem',
});

export const reservationCodeBox = style({
  marginTop: '1rem',
  padding: '1rem',
  border: `2px dashed ${theme.colors.primary}`,
  borderRadius: '8px',
  backgroundColor: theme.colors.white,
  textAlign: 'center',
});

export const reservationCodeText = style({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.colors.primary,
});

// ============================================================
// Utility/Helper Styles
// ============================================================

export const loadingContainer = style({
  width: '800px',
  height: '500px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.paper,
  fontSize: '1.5rem',
  color: theme.colors.beigeText,
  borderRadius: '8px',
});

export const errorText = style({
  color: theme.colors.red,
  textAlign: 'center',
  margin: '1rem 0',
});

export const statusTag = style({
  fontWeight: 'bold',
});

export const statusDone = style({
  color: 'blue', // TODO: 테마 색상으로 변경
});

export const statusPending = style({
  color: theme.colors.red,
});

export const joinButton = style({
  backgroundColor: theme.colors.primary,
  color: theme.colors.white,
  marginTop: 'auto',
});

export const cancelButton = style({
  backgroundColor: theme.colors.disabledBg,
  color: theme.colors.disabledText,
  marginTop: 'auto',
});

export const editButton = style({
  backgroundColor: theme.colors.beigeLight,
  color: theme.colors.beigeText,
});

export const deleteButton = style({
  backgroundColor: theme.colors.red,
  color: theme.colors.white,
});
