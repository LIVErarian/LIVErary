import { style } from '@vanilla-extract/css';

import { pageContainer } from './authCommon.css';

export { footerText, formWrapper, linkText } from './authCommon.css';

export const container = style([
  pageContainer,
  {
    overflowY: 'auto',
    padding: '40px 0',
    alignItems: 'flex-start',
  },
]);

export const checkRow = style({
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-end',
});

export const checkInput = style({
  flex: 1,
});

export const checkBtn = style({
  minWidth: '60px',
});
