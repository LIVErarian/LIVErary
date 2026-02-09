import { style } from '@vanilla-extract/css';

import { pageContainer } from './authCommon.css';

export { footerText, formWrapper, linkText } from './authCommon.css';

export const container = style([
  pageContainer,
  {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage:
      'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), var(--bg-image)',
  },
]);

export const description = style({
  fontSize: '0.9rem',
  color: '#666',
  lineHeight: '1.4',
  textAlign: 'center',
  marginBottom: '1rem',
});

export const inputGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const errorMessage = style({
  color: 'red',
  fontSize: '0.8rem',
  paddingLeft: '4px',
});

export const submitButton = style({
  marginTop: '1.5rem',
});
