import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const panel = style({
  position: 'absolute',
  right: '16px',
  top: '16px',
  zIndex: 20,
  width: '300px',
  padding: '12px',
  borderRadius: '12px',
  border: `1px solid ${theme.colors.woodMedium}`,
  background: 'rgba(74, 38, 25, 0.92)',
  boxShadow: '0 6px 14px rgba(0, 0, 0, 0.28)',
  pointerEvents: 'none',
});

export const title = style({
  color: theme.colors.beigeLight,
  fontSize: '1rem',
  lineHeight: 1.3,
  margin: 0,
  marginBottom: '10px',
  wordBreak: 'break-word',
});

export const chipRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  marginBottom: '10px',
});

export const chip = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '3px 8px',
  borderRadius: '999px',
  backgroundColor: theme.colors.beigeLight,
  color: theme.colors.beigeText,
  fontSize: '0.78rem',
  fontWeight: 700,
  lineHeight: 1,
});

export const bookCard = style({
  display: 'grid',
  gridTemplateColumns: '72px 1fr',
  gap: '10px',
  alignItems: 'start',
});

export const cover = style({
  width: '72px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: `1px solid ${theme.colors.beigeDark}`,
  backgroundColor: theme.colors.woodDark,
});

export const bookText = style({
  minWidth: 0,
});

export const label = style({
  color: theme.colors.beigeLight,
  opacity: 0.9,
  fontSize: '0.75rem',
  marginBottom: '2px',
});

export const value = style({
  color: theme.colors.white,
  fontSize: '0.9rem',
  lineHeight: 1.35,
  marginBottom: '8px',
  wordBreak: 'break-word',
});

export const muted = style({
  color: theme.colors.beigeLight,
  opacity: 0.9,
  fontSize: '0.85rem',
});
