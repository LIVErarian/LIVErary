import { style } from '@vanilla-extract/css';

// 닫기 버튼
export const closeButton = style({
  position: 'absolute',
  top: '12px',
  right: '12px',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  color: '#8B4513',
  fontWeight: 'bold',
  fontFamily: 'inherit',
  transition: 'transform 0.1s',
  ':hover': {
    transform: 'scale(1.2)',
    color: '#ff0000',
  },
});

// footer 외부 영역 정렬
export const modalFooter = style({
  display: 'flex',
  alignItems: 'center',
  marginTop: '16px',
  gap: '12px', // 버튼 사이 간격
});
