import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  width: '500px',
  height: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxSizing: 'border-box',
  padding: '0.5rem 1.5rem',
});

// 검색창 컨테이너
export const searchContainer = style({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  width: '100%',
  marginBottom: '0.5rem',
});

export const searchInput = style({
  flex: 1,
  height: '40px',
  fontSize: '0.95rem',
});

export const searchButton = style({
  minWidth: '60px',
  height: '40px',
});

// 상단 탭 컨테이너
export const tabContainer = style({
  display: 'flex',
  width: '100%',
  gap: '8px',
  marginBottom: '0.5rem',
  alignItems: 'center',
});

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

export const activeTab = style({
  backgroundColor: theme.colors.primary,
  color: theme.colors.white,
  opacity: 1,
});

export const badge = style({
  marginLeft: '6px',
  fontSize: '0.9em',
  color: theme.colors.warning,
  fontWeight: 'bold',
});

export const listContainer = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.paper,
  borderRadius: '8px',
  border: `1px solid ${theme.colors.beigeLight}`,
  flex: 1,
  padding: '0.3rem 0',
  overflowY: 'auto',
});

export const listItem = style({
  display: 'grid',
  gridTemplateColumns: '2fr 3fr 1.5fr', // 닉네임, 이메일, 버튼
  padding: '0.8rem 1rem',
  borderBottom: `1px solid ${theme.colors.beigeLight}`,
  cursor: 'default',
  alignItems: 'center',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'background-color 0.2s',

  selectors: {
    '&:hover': {
      backgroundColor: theme.colors.beigeLight,
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const nickname = style({
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const email = style({
  color: theme.colors.beigeText,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.95rem',
});

export const actionButtons = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '6px',
});

export const emptyState = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  minHeight: '200px',
  flex: 1,
  color: theme.colors.disabledText,
  fontSize: '1.2rem',
  fontWeight: 'bold',
});

export const loading = style({
  textAlign: 'center',
  padding: '20px',
  color: theme.colors.beigeText,
});

export const searchResultCard = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '2rem',
  height: '100%',
  textAlign: 'center',
});

// 상태 태그
export const statusTag = style({
  padding: '6px 12px',
  borderRadius: '4px',
  backgroundColor: theme.colors.beigeLight,
  color: theme.colors.beigeText,
  fontWeight: 'bold',
  fontSize: '0.9rem',
});
