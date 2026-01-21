import { recipe } from '@vanilla-extract/recipes';

import { theme } from '@/styles/theme.css';

export const pixelButton = recipe({
  base: {
    fontFamily: 'inherit',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    textTransform: 'uppercase',
    color: theme.colors.white,
    backgroundColor: theme.colors.woodMedium, // 기본 배경색
    position: 'relative',
    paddingBottom: '4px',

    // 텍스트 선명하게
    WebkitFontSmoothing: 'none',

    boxShadow: `
      /* 안쪽 테두리 (밝은 빛 & 어두운 그림자) */
      inset 2px 2px 0px 0px ${theme.colors.woodLight},      /* 왼쪽/위 하이라이트 */
      inset -2px -2px 0px 0px ${theme.colors.woodDark},     /* 오른쪽/아래 얇은 그림자 */

      /* 하단 굵은 그림자 */
      inset 0px -6px 0px 0px ${theme.colors.woodDark},      /* 텍스트 아래 두꺼운 그림자 */
      
      /* 외곽선 */
      4px 0px 0px 0px ${theme.colors.woodDeep},   /* 오른쪽 외곽 */
      -4px 0px 0px 0px ${theme.colors.woodDeep},  /* 왼쪽 외곽 */
      0px -4px 0px 0px ${theme.colors.woodDeep},  /* 위쪽 외곽 */
      0px 4px 0px 0px ${theme.colors.woodDeep},   /* 아래쪽 외곽 */
      
      /* 외곽선 연결 */
      4px 4px 0px 0px ${theme.colors.woodDeep},
      -4px 4px 0px 0px ${theme.colors.woodDeep},
      4px -4px 0px 0px ${theme.colors.woodDeep},
      -4px -4px 0px 0px ${theme.colors.woodDeep}
    `,

    transition: 'transform 0.05s ease-in-out',

    // 눌렀을 때 효과
    ':active': {
      boxShadow: `
        inset 2px 2px 0px 0px ${theme.colors.woodDark},
        inset -2px -2px 0px 0px ${theme.colors.woodLight},
        inset 0px -2px 0px 0px ${theme.colors.woodDark}, /* 두꺼운 그림자 얇게 */
        
        /* 외곽선 유지 */
        4px 0px 0px 0px ${theme.colors.woodDeep},
        -4px 0px 0px 0px ${theme.colors.woodDeep},
        0px -4px 0px 0px ${theme.colors.woodDeep},
        0px 4px 0px 0px ${theme.colors.woodDeep},
        4px 4px 0px 0px ${theme.colors.woodDeep},
        -4px 4px 0px 0px ${theme.colors.woodDeep},
        4px -4px 0px 0px ${theme.colors.woodDeep},
        -4px -4px 0px 0px ${theme.colors.woodDeep}
      `,
    },
  },

  variants: {
    size: {
      sm: {
        fontSize: '12px',
        height: '32px',
        paddingLeft: '12px',
        paddingRight: '12px',
      },
      md: {
        fontSize: '16px',
        height: '48px',
        paddingLeft: '20px',
        paddingRight: '20px',
      },
      lg: {
        fontSize: '24px',
        height: '64px',
        paddingLeft: '32px',
        paddingRight: '32px',
      },
    },
    fullWidth: {
      true: { width: '100%', display: 'flex' },
    },
    variant: {
      primary: { backgroundColor: theme.colors.woodMedium },
      danger: {
        backgroundColor: theme.colors.red,
        boxShadow: `
          inset 2px 2px 0px 0px #ff8a8a,
          inset -2px -2px 0px 0px #5c0000,
          inset 0px -6px 0px 0px #5c0000, /* 붉은색의 어두운 그림자 */
          
          4px 0px 0px 0px ${theme.colors.woodDeep},
          -4px 0px 0px 0px ${theme.colors.woodDeep},
          0px -4px 0px 0px ${theme.colors.woodDeep},
          0px 4px 0px 0px ${theme.colors.woodDeep},
          4px 4px 0px 0px ${theme.colors.woodDeep},
          -4px 4px 0px 0px ${theme.colors.woodDeep},
          4px -4px 0px 0px ${theme.colors.woodDeep},
          -4px -4px 0px 0px ${theme.colors.woodDeep}
        `,
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});
