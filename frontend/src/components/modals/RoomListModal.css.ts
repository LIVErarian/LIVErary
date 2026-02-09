import { style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

// 전체 컨테이너 (BoardList와 동일)
export const container = style({
  width: '100%',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxSizing: 'border-box',
  padding: '0.5rem 1.5rem',
});

// 상단 툴바
export const toolbar = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '10px',
  gap: '10px',
});

// 검색 그룹
export const searchGroup = style({
  display: 'flex',
  gap: '4px',
  alignItems: 'flex-end',
});

// Input 영역 확보
export const searchInputWrapper = style({
  width: '200px',
});

// 상단 헤더 (탭 버튼)
export const header = style({
  display: 'flex',
  width: '100%',
  gap: '4px',
  marginBottom: '0.5rem',
});

// 탭 버튼 기본 스타일
export const tabButton = style({
  flex: 1,
  height: '40px',
  transition: 'all 0.2s',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: theme.colors.beigeLight,
  color: theme.colors.beigeText,
  opacity: 0.8,
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold',
});

// 활성화된 탭 버튼 스타일
export const activeTab = style({
  backgroundColor: theme.colors.primary,
  color: theme.colors.white,
  opacity: 1,
});

// 게시판 리스트 영역 (테이블 컨테이너)
export const tableContainer = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.paper,
  borderRadius: '8px',
  border: `1px solid ${theme.colors.beigeLight}`,
  flex: 1,
  padding: '0.3rem 0',
  overflow: 'hidden', // 내부 스크롤을 위해 추가
});

// [추가] 리스트 헤더 (BoardList에는 없지만 방 목록엔 필요하므로 tableRow 스타일 기반으로 생성)
export const listHeader = style({
  display: 'grid',
  gridTemplateColumns: '1.5fr 7fr 2fr 2fr', // BoardList와 동일한 비율
  padding: '0.8rem 0.8rem',
  borderBottom: `2px solid ${theme.colors.beigeLight}`,
  fontWeight: 'bold',
  color: theme.colors.woodDeep,
  textAlign: 'center',
  fontSize: '0.95rem',
  backgroundColor: theme.colors.paper, // 배경색 일치
});

// [추가] 리스트 바디 (스크롤 영역)
export const listBody = style({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

// 테이블 행 (리스트 아이템) - BoardList와 동일
export const tableRow = style({
  display: 'grid',
  gridTemplateColumns: '1.5fr 7fr 2fr 2fr', // 비율 유지
  padding: '0.8rem 0.8rem',
  borderBottom: `1px solid ${theme.colors.beigeLight}`,
  cursor: 'pointer',
  alignItems: 'center',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: theme.colors.beigeLight,
  },
  ':last-child': {
    borderBottom: 'none',
  },
});

// 텍스트 스타일 (BoardList와 매핑)
// 1. 상태 (BoardList의 textCategory)
export const textStatus = style({
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '0.9rem',
});

// 상태별 색상 (RoomList 전용 추가)
export const statusLive = style({ color: theme.colors.primary });
export const statusScheduled = style({ color: theme.colors.woodDeep });
export const statusFull = style({ color: theme.colors.red });

// 2. 제목 (BoardList의 textTitle)
export const textTitle = style({
  fontWeight: 'bold',
  paddingLeft: '10px',
  color: theme.colors.woodDeep,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '1.05rem',
  textAlign: 'left', // 명시적 왼쪽 정렬
});

// 3. 정보/카테고리 (BoardList의 textAuthor 위치)
export const textInfo = style({
  textAlign: 'center',
  color: theme.colors.beigeText,
  fontWeight: '500',
  fontSize: '0.95rem',
});

// 4. 인원/날짜 (BoardList의 textDate 위치)
export const textMembers = style({
  textAlign: 'center',
  fontSize: '0.9rem',
  color: theme.colors.beigeDark,
});

// 빈 상태
export const emptyState = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  minHeight: '220px',
  flex: 1,
  color: theme.colors.disabledText,
  fontSize: '1.2rem',
  fontWeight: 'bold',
});

// 페이지네이션
export const pagination = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  marginTop: 'auto',
  paddingTop: '0.5rem',
});

export const pageNumber = style({
  fontFamily: 'monospace',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.colors.black,
});
