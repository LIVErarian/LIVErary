import { style } from '@vanilla-extract/css';

import { palette } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
});

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  alignItems: 'center',
});

export const streakInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  background: palette.beigeLight,
  borderRadius: '8px',
  border: `2px solid ${palette.woodDeep}`,
});

export const streakIcon = style({
  fontSize: '24px',
});

export const streakText = style({
  fontSize: '16px',
  fontWeight: 'bold',
  color: palette.beigeText,
});

export const streakDays = style({
  fontSize: '20px',
  fontWeight: 'bold',
  color: palette.primary,
});

export const checkInButton = style({
  width: '100%',
  padding: '14px',
  fontSize: '16px',
  fontWeight: 'bold',
});

export const calendarSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  minHeight: '400px',
});

export const monthNavigation = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
});

export const monthLabel = style({
  fontSize: '18px',
  fontWeight: 'bold',
  color: palette.beigeText,
});

export const navButton = style({
  padding: '8px 12px',
  background: 'transparent',
  border: `2px solid ${palette.woodDeep}`,
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  ':hover': {
    background: palette.beigeLight,
  },
});

export const calendar = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '4px',
  padding: '8px',
  background: palette.paper,
  borderRadius: '8px',
  border: `2px solid ${palette.woodDeep}`,
  width: '100%',
  boxSizing: 'border-box',
  alignItems: 'center',
});

export const dayHeader = style({
  fontSize: '12px',
  fontWeight: 'bold',
  color: palette.boardText,
  textAlign: 'center',
  padding: '8px 4px',
});

export const dayCell = style({
  position: 'relative',
  aspectRatio: '1.5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5px',
  borderRadius: '4px',
  border: `1px solid ${palette.woodDeep}`,
  background: palette.paper,
  color: palette.beigeText,
  fontSize: '12px',
});

export const dayCellOtherMonth = style({
  color: palette.disabledText,
  opacity: 0.4,
});

export const dayCellToday = style({
  background: palette.beigeLight,
  fontWeight: 'bold',
  border: `2px solid ${palette.primary}`,
});

export const dayNumber = style({
  fontSize: '14px',
  marginBottom: '2px',
});

export const attendanceIndicators = style({
  display: 'flex',
  gap: '2px',
  marginTop: '2px',
});

export const attendanceDot = style({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
});

export const dailyDot = style({
  background: palette.primary,
});

export const readingDot = style({
  background: '#10b981',
});

export const legend = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '24px',
  padding: '12px',
  fontSize: '13px',
});

export const legendItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const errorMessage = style({
  padding: '16px',
  background: '#fee',
  border: '2px solid #fcc',
  borderRadius: '8px',
  color: '#c00',
  textAlign: 'center',
});

export const loadingMessage = style({
  padding: '32px',
  textAlign: 'center',
  color: palette.boardText,
});
