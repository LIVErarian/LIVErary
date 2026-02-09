import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '8px',
  padding: '12px 0',
  marginTop: 'auto',
  opacity: 0.7,
  fontSize: '16px',
  fontWeight: 'bold',
});

export const logo = style({
  height: '24px',
  width: 'auto',
  display: 'block',
});

export const text = style({
  lineHeight: 1,
});
