import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const description = style({
  fontSize: '0.95rem',
  color: theme.colors.boardText,
  textAlign: 'center',
});

export const completionCheck = style({
  padding: '12px',
  backgroundColor: theme.colors.beigeLight,
  borderRadius: '8px',
  marginTop: '8px',
});

export const currentBookSection = style({
  padding: '16px',
  backgroundColor: theme.colors.beigeLight,
  borderRadius: '12px',
  border: `2px solid ${theme.colors.woodMedium}`,
  marginBottom: '8px',
});

export const sectionLabel = style({
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: theme.colors.beigeText,
  marginBottom: '10px',
  display: 'block',
});

export const currentBookInfo = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
});

export const currentBookCover = style({
  width: '50px',
  height: '75px',
  objectFit: 'cover',
  borderRadius: '4px',
  boxShadow: '2px 2px 4px rgba(0,0,0,0.1)',
});

export const currentBookDetails = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const currentBookTitle = style({
  fontSize: '0.95rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});

export const currentBookAuthor = style({
  fontSize: '0.85rem',
  color: theme.colors.beigeText,
});

export const bookList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '400px',
  overflowY: 'auto',
});

export const addBookButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '16px',
  border: `2px dashed ${theme.colors.woodMedium}`,
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  backgroundColor: theme.colors.beigeLight,
  ':hover': {
    backgroundColor: theme.colors.beigeMain,
    borderColor: theme.colors.woodDeep,
  },
});

export const addIcon = style({
  fontSize: '1.5rem',
  lineHeight: 1,
});

export const emptyState = style({
  padding: '40px',
  textAlign: 'center',
  color: theme.colors.beigeText,
});

export const bookItem = style({
  display: 'flex',
  gap: '12px',
  padding: '12px',
  border: `2px solid ${theme.colors.beigeMain}`,
  borderRadius: '8px',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: theme.colors.beigeLight,
  },
});

export const bookItemSelected = style({
  backgroundColor: theme.colors.beigeLight,
  borderColor: theme.colors.woodDeep,
});

export const bookCover = style({
  width: '60px',
  height: '90px',
  objectFit: 'cover',
  borderRadius: '4px',
});

export const bookInfo = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const bookTitle = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
});

export const bookAuthor = style({
  fontSize: '0.85rem',
  color: theme.colors.beigeText,
});

export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
});
