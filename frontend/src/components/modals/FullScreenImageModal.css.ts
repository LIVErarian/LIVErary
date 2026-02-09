import { style } from '@vanilla-extract/css';

// 모달 전체 배경 (검은색 오버레이)
export const container = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#000',
  zIndex: 9999, // 최상위 레이어
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'default',
});

// 우측 상단 닫기 버튼
export const closeButton = style({
  position: 'absolute',
  top: '30px',
  right: '30px',
  background: 'rgba(0, 0, 0, 0.5)',
  border: '2px solid white',
  color: 'white',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  fontSize: '24px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  transition: 'background 0.2s, transform 0.2s',

  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'scale(1.1)',
  },
});

// 미디어(비디오/이미지)를 감싸는 컨테이너
export const mediaWrapper = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  // 내부 클릭 시 모달 닫히지 않도록 이벤트 전파 방지용으로 사용
});

// 실제 비디오/이미지 스타일
export const mediaElement = style({
  width: '100%',
  height: '100%',
  objectFit: 'contain', // 비율 유지하며 화면에 꽉 차게
  display: 'block',
});

// 에러 메시지 컨테이너
export const errorContainer = style({
  color: 'white',
  textAlign: 'center',
  marginTop: '20%',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});
