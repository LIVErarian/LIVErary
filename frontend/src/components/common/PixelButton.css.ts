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
    backgroundColor: theme.colors.woodMedium,
    position: 'relative',
    paddingBottom: '4px',
    userSelect: 'none',
    WebkitFontSmoothing: 'none',

    boxShadow: `
      /* 안쪽 테두리 */
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
        inset 0px -2px 0px 0px ${theme.colors.woodDark},
        
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
        minWidth: '32px',
        paddingLeft: '12px',
        paddingRight: '12px',
      },
      md: {
        fontSize: '16px',
        height: '48px',
        minWidth: '48px',
        paddingLeft: '20px',
        paddingRight: '20px',
      },
      lg: {
        fontSize: '24px',
        height: '64px',
        minWidth: '64px',
        paddingLeft: '32px',
        paddingRight: '32px',
      },
    },
    shape: {
      default: {},
      square: {
        padding: 0,
      },
      circle: {
        borderRadius: '50%',
        padding: 0,
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
          inset 0px -4px 0px 0px #5c0000, /* 붉은색의 어두운 그림자 */
          
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
      beige: {
        backgroundColor: theme.colors.beigeMain,
        color: theme.colors.beigeText,
        boxShadow: `
          inset 2px 2px 0px 0px ${theme.colors.beigeLight},
          inset -2px -2px 0px 0px ${theme.colors.beigeDark},
          inset 0px -4px 0px 0px ${theme.colors.beigeDeep},
          
          4px 0px 0px 0px ${theme.colors.beigeText},
          -4px 0px 0px 0px ${theme.colors.beigeText},
          0px -4px 0px 0px ${theme.colors.beigeText},
          0px 4px 0px 0px ${theme.colors.beigeText},
          4px 4px 0px 0px ${theme.colors.beigeText},
          -4px 4px 0px 0px ${theme.colors.beigeText},
          4px -4px 0px 0px ${theme.colors.beigeText},
          -4px -4px 0px 0px ${theme.colors.beigeText}
        `,

        ':active': {
          boxShadow: `
            inset 2px 2px 0px 0px ${theme.colors.beigeDark},
            inset -2px -2px 0px 0px ${theme.colors.beigeLight},
            inset 0px -2px 0px 0px ${theme.colors.beigeDeep},
            
            4px 0px 0px 0px ${theme.colors.beigeText},
            -4px 0px 0px 0px ${theme.colors.beigeText},
            0px -4px 0px 0px ${theme.colors.beigeText},
            0px 4px 0px 0px ${theme.colors.beigeText},
            4px 4px 0px 0px ${theme.colors.beigeText},
            -4px 4px 0px 0px ${theme.colors.beigeText},
            4px -4px 0px 0px ${theme.colors.beigeText},
            -4px -4px 0px 0px ${theme.colors.beigeText}
          `,
        },
      },
      disabled: {
        backgroundColor: theme.colors.disabledBg,
        color: theme.colors.disabledText,
        cursor: 'not-allowed',

        boxShadow: `
          inset 2px 2px 0px 0px ${theme.colors.disabledLight},
          inset -2px -2px 0px 0px ${theme.colors.disabledDark},
          inset 0px -6px 0px 0px ${theme.colors.disabledDark},
          
          4px 0px 0px 0px ${theme.colors.disabledDeep},
          -4px 0px 0px 0px ${theme.colors.disabledDeep},
          0px -4px 0px 0px ${theme.colors.disabledDeep},
          0px 4px 0px 0px ${theme.colors.disabledDeep},
          4px 4px 0px 0px ${theme.colors.disabledDeep},
          -4px 4px 0px 0px ${theme.colors.disabledDeep},
          4px -4px 0px 0px ${theme.colors.disabledDeep},
          -4px -4px 0px 0px ${theme.colors.disabledDeep}
        `,

        ':active': {
          transform: 'none',
          boxShadow: `
            inset 2px 2px 0px 0px ${theme.colors.disabledLight},
            inset -2px -2px 0px 0px ${theme.colors.disabledDark},
            inset 0px -6px 0px 0px ${theme.colors.disabledDark},
            
            /* 외곽선 유지 (위와 동일) */
            4px 0px 0px 0px ${theme.colors.disabledDeep},
            -4px 0px 0px 0px ${theme.colors.disabledDeep},
            0px -4px 0px 0px ${theme.colors.disabledDeep},
            0px 4px 0px 0px ${theme.colors.disabledDeep},
            4px 4px 0px 0px ${theme.colors.disabledDeep},
            -4px 4px 0px 0px ${theme.colors.disabledDeep},
            4px -4px 0px 0px ${theme.colors.disabledDeep},
            -4px -4px 0px 0px ${theme.colors.disabledDeep}
          `,
        },
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'primary',
    shape: 'default',
  },
});
