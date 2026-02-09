import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

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
  width: '100%',
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
