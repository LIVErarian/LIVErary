import { PixelButton } from '@/components/common/PixelButton';
import { useGameStore } from '@/store/useGameStore';

import * as styles from '@/components/layout/GameLayout.css';

const ROOM_TITLES: Record<string, string> = {
  lobby: '중앙 로비',
  myRoom: '내 방',
  readingFloor: '독서실',
  conferenceFloor: '회의실',
  bookConcert: '북 콘서트 홀',
  bookTalkFloor: '독서 모임 공간',
};

export const GameSidebar = () => {
  const { currentFloor, setCurrentFloor } = useGameStore();

  const title = ROOM_TITLES[currentFloor] || currentFloor;

  const renderMainActionBtn = () => {
    // 내 방이면 로비로, 그 외에는 내 방으로
    if (currentFloor === 'myRoom') {
      return (
        <PixelButton
          variant="beige"
          shape="square"
          size="lg"
          onClick={() => setCurrentFloor('lobby')}
        >
          🏙️
        </PixelButton>
      );
    }
    return (
      <div className={styles.sidebarButton}>
        {/* 1. 홈/내방 이동 */}
        <PixelButton
          variant="beige"
          shape="square"
          size="lg"
          onClick={() => setCurrentFloor('myRoom')}
        >
          🏠
        </PixelButton>

        {/* 2. 엘리베이터 */}
        <PixelButton
          variant="beige"
          shape="square"
          size="lg"
          onClick={() => alert('엘리베이터')}
        >
          🛗
        </PixelButton>

        {/* 3. 게시판 */}
        <PixelButton
          variant="beige"
          shape="square"
          size="lg"
          onClick={() => alert('게시판')}
        >
          📋
        </PixelButton>

        {/* 4. 랭킹/정보 */}
        {renderContextBtn()}
      </div>
    );
  };

  const renderContextBtn = () => {
    // 열람실이면 랭킹 버튼, 그 외에는 방 정보 버튼
    if (currentFloor === 'readingFloor') {
      return (
        <PixelButton
          variant="beige"
          shape="square"
          size="lg"
          onClick={() => alert('랭킹')}
        >
          🏆
        </PixelButton>
      ); // 랭킹
    }
    return (
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => alert('방 정보')}
      >
        ℹ️
      </PixelButton>
    ); // 방 정보
  };

  return (
    <div className={styles.sidebarMenu}>
      <h3 style={{ color: 'white' }}>{title}</h3>
      {/* 위쪽은 게임 관련 기능 */}
      {renderMainActionBtn()}

      {/* ⬇️ [하단] 프로필 및 설정 */}
      <div className={styles.profileSection}>
        {/* 1. 플레이어 정보 */}
        <div className={styles.profileRow}>
          <div className={styles.avatarCircle} />
          <span className={styles.playerName}>Player</span>
        </div>

        {/* 2. 미디어 컨트롤 (마이크만 남김) */}
        <div className={styles.mediaRow}>
          <PixelButton
            variant="beige"
            shape="circle"
            size="sm"
            onClick={() => alert('마이크 토글')}
          >
            🎤
          </PixelButton>
        </div>

        {/* 3. 로그아웃 (꽉 찬 버튼) */}
        <PixelButton
          variant="danger"
          fullWidth
          onClick={() => alert('로그아웃')}
        >
          로그아웃
        </PixelButton>
      </div>
    </div>
  );
};
