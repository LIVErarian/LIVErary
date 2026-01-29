import { createGlobalTheme } from '@vanilla-extract/css';

// 실제 색상 값 (PixiJS용)
export const palette = {
  // 메인 브랜드 컬러
  primary: '#420e07',
  background: '#240d04',
  side: '#7A5835',

  // UI용 나무 색상 팔레트
  woodLight: '#eec39a',
  woodMedium: '#C58346',
  woodDark: '#8d563e',
  woodDeep: '#4a2619',

  // Beige 톤 색상 팔레트
  beigeMain: '#d3c19e',
  beigeLight: '#ddd3b9',
  beigeDark: '#9e8b62',
  beigeDeep: '#8f7d52',
  beigeText: '#634038',

  // Input용 색상 팔레트
  inputBg: '#633E2B',
  inputText: '#f2dcb3',

  // 게시판용 색상 팔레트
  boardBg: '#CBAB79',
  loginBg: '#8a5631',
  boardText: '#59402b',
  boardShadow: '#b89f7d',
  boardBorder: '#8d5d3e',

  // 종이 질감 팔레트
  paper: '#fdf6e3',

  // 기능성 컬러
  red: '#810000',
  success: '#002907',
  warning: '#ec8f00',

  // 무채색
  black: '#292929',
  white: '#ffffff',
};

export const theme = createGlobalTheme(':root', {
  colors: palette,

  // 폰트 사이즈, 간격 등
  size: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
});
