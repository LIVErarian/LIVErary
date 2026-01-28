import { keyframes, style } from '@vanilla-extract/css';

// 등장 애니메이션
const popIn = keyframes({
  '0%': { transform: 'scale(0.9)', opacity: 0 },
  '100%': { transform: 'scale(1)', opacity: 1 },
});

// 배경 오버레이
export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(2px)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

// 모달 컨텐츠 래퍼
export const modalContent = style({
  position: 'relative',
  animation: `${popIn} 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
  outline: 'none',
  maxWidth: '90vw',
  maxHeight: '90vh',
});

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
