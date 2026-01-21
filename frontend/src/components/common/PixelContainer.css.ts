import { recipe } from '@vanilla-extract/recipes';

import { theme } from '@/styles/theme.css';

export const container = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    imageRendering: 'pixelated',
    fontFamily: 'inherit',
    WebkitFontSmoothing: 'none',
    borderStyle: 'solid',
    borderWidth: '0px',
  },

  variants: {
    variant: {
      // 일반 게시판
      board: {
        backgroundColor: theme.colors.boardBg,
        color: theme.colors.boardText,
        padding: '32px',

        boxShadow: `
          /* 안쪽 그림자 */
          inset 0px 0px 20px 0px ${theme.colors.boardShadow},
          
          /* 테두리 나무 프레임 */
          0px 0px 0px 4px ${theme.colors.woodMedium},  /* 1차 밝은 나무 */
          0px 0px 0px 8px ${theme.colors.woodDeep},
          
          /* 전체 그림자 */
          8px 8px 0px 4px rgba(0,0,0,0.3),

          /* 모서리 */
          8px 8px 0px 4px ${theme.colors.woodDeep},
          -8px 8px 0px 4px ${theme.colors.woodDeep},
          8px -8px 0px 4px ${theme.colors.woodDeep},
          -8px -8px 0px 4px ${theme.colors.woodDeep}
        `,
      },

      // 로그인용 게시판
      dark: {
        backgroundColor: theme.colors.loginBg,
        color: theme.colors.woodLight,
        padding: '40px',

        boxShadow: `
          /* 내부 그림자 */
          inset 4px 4px 0px 0px rgba(0,0,0,0.3),
          
          /* 테두리 */
          0px 0px 0px 4px ${theme.colors.woodMedium}, 
          0px 0px 0px 8px ${theme.colors.black},
          
          /* 외부 그림자 */
          8px 8px 0px 4px rgba(0,0,0,0.5),

          /* 모서리 */
          8px 8px 0px 4px ${theme.colors.black},
          -8px 8px 0px 4px ${theme.colors.black},
          8px -8px 0px 4px ${theme.colors.black},
          -8px -8px 0px 4px ${theme.colors.black}
        `,
      },
    },
  },

  defaultVariants: {
    variant: 'board',
  },
});
