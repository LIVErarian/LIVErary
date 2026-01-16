import { createGlobalTheme } from '@vanilla-extract/css';

export const theme = createGlobalTheme(':root', {
  colors: {
    // 메인 브랜드 컬러
    primary: '#420e07',
    background: '#240d04',

    // 기능성 컬러
    red: '#810000',
    success: '#002907',
    warning: '#ec8f00',

    // 무채색
    black: '#292929',
    white: '#ffffff',
  },

  // 폰트 사이즈, 간격 등
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
});
