import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export {
  footerText,
  formWrapper,
  linkText,
  pageContainer,
} from './AuthCommon.css';

export const description = style({
  color: theme.colors.woodLight,
  marginBottom: '24px',
  opacity: 0.8,
  textAlign: 'center',
  fontSize: '0.9rem',
});

export const linkGroup = style({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '12px',
  fontSize: '0.8rem',
  color: '#bcaaa4',
});
