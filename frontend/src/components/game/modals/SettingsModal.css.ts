import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

// 섹션 구분
export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const sectionTitle = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  borderBottom: `2px solid ${theme.colors.woodMedium}`,
  paddingBottom: '8px',
  marginBottom: '4px',
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  minHeight: '32px',
});

// 텍스트 라벨
export const label = style({
  fontSize: '0.9rem',
  color: theme.colors.boardText,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

// 🎚️ 커스텀 슬라이더
export const slider = style({
  flex: 1,
  height: '8px',
  backgroundColor: theme.colors.woodLight, // 트랙 색상
  borderRadius: '4px',
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer',
  border: `1px solid ${theme.colors.woodDark}`,

  // 비활성화 상태
  ':disabled': {
    backgroundColor: theme.colors.disabledBg,
    cursor: 'not-allowed',
    opacity: 0.6,
  },

  // 핸들 (Thumb) 스타일 - Webkit
  '::-webkit-slider-thumb': {
    appearance: 'none',
    width: '16px',
    height: '16px',
    backgroundColor: theme.colors.primary, // 핸들 색상
    border: `2px solid ${theme.colors.woodDeep}`,
    borderRadius: '2px', // 네모난 느낌
    cursor: 'pointer',
    marginTop: '-5px', // 트랙 중앙 정렬 보정
  },

  // 핸들 (Thumb) 스타일 - Firefox
  '::-moz-range-thumb': {
    width: '16px',
    height: '16px',
    backgroundColor: theme.colors.primary,
    border: `2px solid ${theme.colors.woodDeep}`,
    borderRadius: '2px',
    cursor: 'pointer',
  },
});

// 🎤 마이크 볼륨 바 (컨테이너)
export const micBarContainer = style({
  width: '100%',
  height: '12px',
  backgroundColor: '#2c2c2c', // 어두운 배경
  borderRadius: '6px',
  border: '2px solid #555',
  overflow: 'hidden',
  marginTop: '8px',
});

// 🎤 마이크 볼륨 바 (채워지는 부분)
export const micBarFill = style({
  height: '100%',
  backgroundColor: '#4ade80', // 밝은 초록색
  transition: 'width 0.1s linear', // 부드럽게 움직임
  boxShadow: '0 0 8px #4ade80', // 약간의 야광 효과
});

// 🔘 커스텀 체크박스 래퍼
export const checkboxWrapper = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  userSelect: 'none',
});

// 실제 input 숨김
export const hiddenCheckbox = style({
  display: 'none',
});

// 보여지는 체크박스 디자인
export const customCheckbox = style({
  width: '20px',
  height: '20px',
  border: `2px solid ${theme.colors.woodDeep}`,
  backgroundColor: theme.colors.woodLight,
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 'bold',
  color: theme.colors.red, // 체크 표시 색상

  selectors: {
    [`${hiddenCheckbox}:checked + &`]: {
      backgroundColor: theme.colors.paper,
      borderColor: theme.colors.primary,
    },
  },
});

// 계정 정보 텍스트
export const accountInfo = style({
  backgroundColor: 'rgba(0,0,0,0.05)',
  padding: '8px 12px',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});
