import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const widgetContainer = style({
  position: 'fixed',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1000,
  fontFamily: 'Pretendard, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  border: `1px solid ${theme.colors.woodDark}`,
  pointerEvents: 'auto', // 상위 레이어 무시하고 클릭 가능하게
});

// 상단 헤더 (탭 + 드래그 핸들)
export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 8px',
  backgroundColor: theme.colors.woodDeep,
  borderBottom: `1px solid ${theme.colors.woodDark}`,
  cursor: 'move',
  userSelect: 'none',
});

// 탭 그룹
export const tabGroup = style({
  display: 'flex',
  gap: '4px',
  // 드래그 중 텍스트 선택 방지
  pointerEvents: 'none',
});

// 탭 버튼
export const tabButton = style({
  pointerEvents: 'auto',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 'bold',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  color: theme.colors.beigeLight,
  backgroundColor: 'transparent',
  transition: 'all 0.2s',

  selectors: {
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    '&[data-active="true"]': {
      backgroundColor: theme.colors.woodMedium,
      color: theme.colors.white,
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
    },
  },
});

// 최소화 버튼
export const controlButton = style({
  background: 'none',
  border: 'none',
  color: theme.colors.beigeLight,
  fontSize: '16px',
  cursor: 'pointer',
  padding: '0 4px',
  pointerEvents: 'auto',
  selectors: {
    '&:hover': { color: theme.colors.warning },
  },
});

// 채팅 내용 영역
export const chatBody = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
});

export const messageList = style({
  flex: 1,
  overflowY: 'auto',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  fontSize: '13px',
  color: theme.colors.white,
});

// 하단 입력 영역 (드롭다운 + 입력창 + 버튼)
export const inputArea = style({
  display: 'flex',
  alignItems: 'center',
  padding: '6px',
  gap: '4px',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  borderTop: `1px solid ${theme.colors.woodDark}`,
});

// 전송 타겟 선택 (드롭다운)
export const targetSelect = style({
  backgroundColor: theme.colors.woodDeep,
  color: theme.colors.beigeLight,
  border: `1px solid ${theme.colors.woodDark}`,
  borderRadius: '4px',
  padding: '4px 2px',
  fontSize: '11px',
  outline: 'none',
  cursor: 'pointer',
  maxWidth: '60px',
});

// 입력창
export const input = style({
  flex: 1, // 남은 공간 모두 차지
  backgroundColor: theme.colors.inputBg,
  color: theme.colors.inputText,
  border: `1px solid ${theme.colors.woodDark}`,
  borderRadius: '4px',
  padding: '4px 8px',
  fontSize: '13px',
  outline: 'none',
  '::placeholder': { color: theme.colors.beigeDeep },
  selectors: {
    '&:focus': { border: `1px solid ${theme.colors.woodLight}` },
  },
});

// 전송 버튼
export const sendButton = style({
  backgroundColor: theme.colors.woodMedium,
  color: theme.colors.white,
  border: `1px solid ${theme.colors.woodDark}`,
  borderRadius: '4px',
  padding: '4px 8px',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: 'bold',
  selectors: {
    '&:hover': { backgroundColor: theme.colors.woodLight },
    '&:active': { transform: 'translateY(1px)' },
  },
});

// 메시지 아이템
export const messageItem = style({
  lineHeight: '1.4',
  wordBreak: 'break-all',
  textShadow: '1px 1px 0 #000',
});

export const senderName = style({
  cursor: 'pointer',
  fontWeight: 'bold',
  marginRight: '4px',
  selectors: { '&:hover': { textDecoration: 'underline' } },
});
