import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  width: '500px',
  height: '450px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxSizing: 'border-box',
  padding: '0.5rem 1.5rem',
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

// 내 랭킹 카드
export const myRankingCard = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.5rem',
  backgroundColor: theme.colors.primary,
  borderRadius: '8px',
  color: theme.colors.white,
  fontWeight: 'bold',
});

export const myRankingLabel = style({
  fontSize: '0.9rem',
  opacity: 0.9,
});

export const myRankingInfo = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.5rem',
});

export const myRankingRank = style({
  fontSize: '1.5rem',
  fontWeight: 'bold',
});

export const myRankingTime = style({
  fontSize: '1rem',
  opacity: 0.9,
});

// 랭킹 리스트 컨테이너
export const listContainer = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.paper,
  borderRadius: '8px',
  border: `1px solid ${theme.colors.beigeLight}`,
  flex: 1,
  padding: '0.3rem 0',
  overflowY: 'auto',

  '::-webkit-scrollbar': {
    width: '10px',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: theme.colors.woodMedium,
    borderRadius: '5px',
    border: `2px solid ${theme.colors.paper}`,
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
});

// 랭킹 리스트 아이템
export const listItem = style({
  display: 'grid',
  gridTemplateColumns: '50px 1fr 100px', // 순위, 닉네임, 시간
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

// Top 3 스타일
export const topRankItem = style({
  backgroundColor: `rgba(${theme.colors.warning}, 0.05)`,
});

// 순위
export const rank = style({
  fontWeight: 'bold',
  color: theme.colors.primary,
  fontSize: '1.1rem',
  textAlign: 'center',
});

// Top 3 메달 스타일
export const goldRank = style({
  color: '#FFD700',
  fontSize: '1.3rem',
});

export const silverRank = style({
  color: '#C0C0C0',
  fontSize: '1.25rem',
});

export const bronzeRank = style({
  color: '#CD7F32',
  fontSize: '1.2rem',
});

// 닉네임
export const nickname = style({
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  paddingLeft: '0.5rem',
});

// 독서 시간
export const readingTime = style({
  color: theme.colors.beigeText,
  textAlign: 'right',
  fontSize: '0.95rem',
});

// 빈 상태
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

// 로딩 상태
export const loading = style({
  textAlign: 'center',
  padding: '20px',
  color: theme.colors.beigeText,
});
