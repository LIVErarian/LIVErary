import { keyframes, style } from '@vanilla-extract/css';

import { palette } from '@/styles/theme.css';

// 애니메이션 정의
const bounce = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-10px)' },
});

const slide = keyframes({
  '0%': { backgroundPosition: '0 0' },
  '100%': { backgroundPosition: '40px 40px' },
});

// 전체 화면 컨테이너 (어두운 배경)
export const container = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: palette.background, // #240d04
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  fontFamily: "'Press Start 2P', 'DungGeunMo', sans-serif", // 픽셀 폰트
});

// 3. 중앙 게시판 (밝은 나무/종이 느낌)
export const board = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '80%',
  maxWidth: '400px',
  padding: '40px 20px',

  backgroundColor: palette.boardBg, // #CBAB79
  border: `4px solid ${palette.boardBorder}`, // #8d5d3e
  borderRadius: '8px',

  // 픽셀 아트 스타일 그림자 (블러 없음)
  boxShadow: `8px 8px 0px ${palette.primary}`, // #420e07
});

// 4. 아이콘 (책)
export const icon = style({
  fontSize: '48px',
  marginBottom: '20px',
  animation: `${bounce} 1s infinite ease-in-out`,
});

// 5. 제목 텍스트
export const title = style({
  fontSize: '20px',
  color: palette.boardText, // #59402b
  fontWeight: 'bold',
  marginBottom: '24px',
  textAlign: 'center',
});

// 6. 로딩바 컨테이너 (움푹 들어간 느낌)
export const barContainer = style({
  width: '100%',
  height: '24px',
  backgroundColor: palette.woodDeep, // #4a2619 (어두운 나무색으로 파인 느낌)
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  border: `2px solid ${palette.boardBorder}`,
});

// 7. 로딩바 채움 (빗살무늬 패턴)
export const barFill = style({
  height: '100%',
  backgroundColor: palette.red, // #810000 (포인트 컬러)
  transition: 'width 0.3s ease-out',

  // 빗살무늬 패턴 추가
  backgroundImage: `linear-gradient(
    45deg, 
    rgba(255, 255, 255, 0.15) 25%, 
    transparent 25%, 
    transparent 50%, 
    rgba(255, 255, 255, 0.15) 50%, 
    rgba(255, 255, 255, 0.15) 75%, 
    transparent 75%, 
    transparent
  )`,
  backgroundSize: '20px 20px',
  animation: `${slide} 1s linear infinite`,
});

// 8. 하단 메시지
export const messageText = style({
  marginTop: '20px',
  fontSize: '12px',
  color: palette.boardText,
  textAlign: 'center',
  lineHeight: '1.5',
  minHeight: '1.5em', // 텍스트 바뀔 때 흔들림 방지
});

export const percentText = style({
  marginTop: '8px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: palette.boardText,
});
