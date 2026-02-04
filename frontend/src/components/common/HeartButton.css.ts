import { style } from '@vanilla-extract/css';

/**
 * 픽셀 아트 하트 (빨간색 - 찜한 상태)
 */
export const pixelHeart = style({
  width: '3px',
  height: '3px',
  backgroundColor: '#e74c3c',

  // 픽셀 아트 하트 모양 (16x14 픽셀)
  boxShadow: `
    /* 1행 */
    3px 0px 0 #e74c3c, 6px 0px 0 #e74c3c, 9px 0px 0 #e74c3c,
    15px 0px 0 #e74c3c, 18px 0px 0 #e74c3c, 21px 0px 0 #e74c3c,
    
    /* 2행 */
    0px 3px 0 #e74c3c, 3px 3px 0 #c0392b, 6px 3px 0 #e74c3c, 9px 3px 0 #e74c3c, 12px 3px 0 #e74c3c,
    15px 3px 0 #e74c3c, 18px 3px 0 #c0392b, 21px 3px 0 #e74c3c, 24px 3px 0 #e74c3c,
    
    /* 3행 */
    0px 6px 0 #e74c3c, 3px 6px 0 #c0392b, 6px 6px 0 #e74c3c, 9px 6px 0 #e74c3c, 12px 6px 0 #e74c3c,
    15px 6px 0 #e74c3c, 18px 6px 0 #e74c3c, 21px 6px 0 #c0392b, 24px 6px 0 #e74c3c,
    
    /* 4행 */
    0px 9px 0 #e74c3c, 3px 9px 0 #e74c3c, 6px 9px 0 #e74c3c, 9px 9px 0 #e74c3c, 12px 9px 0 #e74c3c,
    15px 9px 0 #e74c3c, 18px 9px 0 #e74c3c, 21px 9px 0 #e74c3c, 24px 9px 0 #e74c3c,
    
    /* 5행 */
    3px 12px 0 #e74c3c, 6px 12px 0 #e74c3c, 9px 12px 0 #e74c3c, 12px 12px 0 #e74c3c,
    15px 12px 0 #e74c3c, 18px 12px 0 #e74c3c, 21px 12px 0 #e74c3c,
    
    /* 6행 */
    6px 15px 0 #e74c3c, 9px 15px 0 #e74c3c, 12px 15px 0 #e74c3c, 15px 15px 0 #e74c3c, 18px 15px 0 #e74c3c,
    
    /* 7행 */
    9px 18px 0 #e74c3c, 12px 18px 0 #e74c3c, 15px 18px 0 #e74c3c,
    
    /* 8행 (맨 아래) */
    12px 21px 0 #e74c3c
  `,

  marginLeft: '-12px',
  marginTop: '-10px',
});

/**
 * 픽셀 아트 하트 (회색 - 찜하지 않은 상태)
 */
export const pixelHeartGray = style({
  width: '3px',
  height: '3px',
  backgroundColor: '#95a5a6',

  // 픽셀 아트 하트 모양 (16x14 픽셀) - 회색 버전
  boxShadow: `
    /* 1행 */
    3px 0px 0 #95a5a6, 6px 0px 0 #95a5a6, 9px 0px 0 #95a5a6,
    15px 0px 0 #95a5a6, 18px 0px 0 #95a5a6, 21px 0px 0 #95a5a6,
    
    /* 2행 */
    0px 3px 0 #95a5a6, 3px 3px 0 #7f8c8d, 6px 3px 0 #95a5a6, 9px 3px 0 #95a5a6, 12px 3px 0 #95a5a6,
    15px 3px 0 #95a5a6, 18px 3px 0 #7f8c8d, 21px 3px 0 #95a5a6, 24px 3px 0 #95a5a6,
    
    /* 3행 */
    0px 6px 0 #95a5a6, 3px 6px 0 #7f8c8d, 6px 6px 0 #95a5a6, 9px 6px 0 #95a5a6, 12px 6px 0 #95a5a6,
    15px 6px 0 #95a5a6, 18px 6px 0 #95a5a6, 21px 6px 0 #7f8c8d, 24px 6px 0 #95a5a6,
    
    /* 4행 */
    0px 9px 0 #95a5a6, 3px 9px 0 #95a5a6, 6px 9px 0 #95a5a6, 9px 9px 0 #95a5a6, 12px 9px 0 #95a5a6,
    15px 9px 0 #95a5a6, 18px 9px 0 #95a5a6, 21px 9px 0 #95a5a6, 24px 9px 0 #95a5a6,
    
    /* 5행 */
    3px 12px 0 #95a5a6, 6px 12px 0 #95a5a6, 9px 12px 0 #95a5a6, 12px 12px 0 #95a5a6,
    15px 12px 0 #95a5a6, 18px 12px 0 #95a5a6, 21px 12px 0 #95a5a6,
    
    /* 6행 */
    6px 15px 0 #95a5a6, 9px 15px 0 #95a5a6, 12px 15px 0 #95a5a6, 15px 15px 0 #95a5a6, 18px 15px 0 #95a5a6,
    
    /* 7행 */
    9px 18px 0 #95a5a6, 12px 18px 0 #95a5a6, 15px 18px 0 #95a5a6,
    
    /* 8행 (맨 아래) */
    12px 21px 0 #95a5a6
  `,

  marginLeft: '-12px',
  marginTop: '-10px',
});

/**
 * 하트 버튼 기본 스타일
 */
export const heartButton = style({
  width: '30px',
  height: '30px',

  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',

  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  transition: 'transform 0.1s ease-in-out',
  position: 'relative',
  zIndex: 10,

  ':hover': {
    transform: 'translate(-1px, -1px) scale(1.1)',
  },

  ':active': {
    transform: 'translate(1px, 1px) scale(0.95)',
  },

  ':disabled': {
    opacity: 0.6,
    cursor: 'default',
  },
});
