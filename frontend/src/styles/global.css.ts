import { globalFontFace, globalStyle } from '@vanilla-extract/css';

import { theme } from './theme.css';

export const contentFont = 'ThinDungGeunMo';
export const titleFont = 'NeoDunggeunmoPro-Regular';

// 얇은둥근모
globalFontFace(contentFont, {
  src: `url('https://cdn.jsdelivr.net/gh/projectnoonnu/2511-1@1.0/ThinDungGeunMo.woff2') format('woff2')`,
  fontWeight: 'normal',
  fontDisplay: 'swap',
});

// Neo둥근고딕Pro
globalFontFace(titleFont, {
  src: `url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302@1.0/NeoDunggeunmoPro-Regular.woff2') format('woff2')`,
  fontWeight: 'normal',
  fontDisplay: 'swap',
});

globalStyle('body, html', {
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  fontFamily: contentFont,
  fontSize: '16px',
  lineHeight: '1.5',
});

globalStyle('#root', {
  width: '100%',
  height: '100%',
});

// 제목용 폰트
globalStyle('h1, h2, h3, h4, h5, h6', {
  fontFamily: titleFont,
  fontWeight: 'normal',
  margin: 0,
});

globalStyle('*', {
  fontFamily: contentFont,
  WebkitFontSmoothing: 'none',
});

// 전역 스크롤바 디자인 통일
globalStyle('::-webkit-scrollbar', {
  width: '8px', // 세로 스크롤 너비
  height: '8px', // 가로 스크롤 높이
  backgroundColor: 'transparent', // 트랙(배경)은 투명하게
});

globalStyle('::-webkit-scrollbar-thumb', {
  backgroundColor: theme.colors.beigeDark, // 손잡이 색상
  borderRadius: '4px', // 둥근 모서리
});

globalStyle('::-webkit-scrollbar-track', {
  backgroundColor: 'transparent', // 트랙 배경 (필요 시 theme.colors.beige 등으로 변경 가능)
});

// Firefox 호환성 (선택 사항)
globalStyle('*', {
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.colors.beigeDark} transparent`,
});
