import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const inputWrapper = style({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  backgroundColor: theme.colors.inputBg, // 어두운 배경
  height: '48px',
  padding: '0 16px',
  marginTop: '4px', // 라벨과의 간격
  marginBottom: '1rem',

  boxShadow: `
    /* 내부 그림자 */
    inset 4px 4px 0px 0px rgba(0,0,0,0.2),
    inset 2px 2px 0px 0px ${theme.colors.black},
    
    /* 외곽선 */
    4px 0px 0px 0px ${theme.colors.woodDeep},
    -4px 0px 0px 0px ${theme.colors.woodDeep},
    0px -4px 0px 0px ${theme.colors.woodDeep},
    0px 4px 0px 0px ${theme.colors.woodDeep},
    
    /* 모서리 연결 */
    4px 4px 0px 0px ${theme.colors.woodDeep},
    -4px 4px 0px 0px ${theme.colors.woodDeep},
    4px -4px 0px 0px ${theme.colors.woodDeep},
    -4px -4px 0px 0px ${theme.colors.woodDeep}
  `,

  // 입력 중일 때(Focus) 하이라이트 효과
  ':focus-within': {
    boxShadow: `
      inset 4px 4px 0px 0px rgba(0,0,0,0.2), 
      
      /* 외곽선 유지 */
      4px 0px 0px 0px ${theme.colors.woodMedium},
      -4px 0px 0px 0px ${theme.colors.woodMedium},
      0px -4px 0px 0px ${theme.colors.woodMedium},
      0px 4px 0px 0px ${theme.colors.woodMedium},
      4px 4px 0px 0px ${theme.colors.woodMedium},
      -4px 4px 0px 0px ${theme.colors.woodMedium},
      4px -4px 0px 0px ${theme.colors.woodMedium},
      -4px -4px 0px 0px ${theme.colors.woodMedium}
    `,
  },
});

// 실제 input 태그
export const input = style({
  width: '100%',
  height: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',

  fontFamily: 'inherit',
  fontSize: '16px',
  color: theme.colors.inputText,

  '::placeholder': {
    color: '#8d7063',
    opacity: 0.7,
  },
});

// 라벨 스타일
export const label = style({
  fontSize: '16px',
  color: theme.colors.woodLight,
  textTransform: 'uppercase',
  textShadow: '2px 2px 0px #000',
  marginBottom: '4px',
  display: 'block',
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});
