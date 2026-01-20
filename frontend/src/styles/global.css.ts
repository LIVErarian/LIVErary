import { globalFontFace, globalStyle } from '@vanilla-extract/css';

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
