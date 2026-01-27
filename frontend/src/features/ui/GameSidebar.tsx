import { PixelButton } from '@/components/common/PixelButton';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';

import type { FloorType } from '@/types/map.types';

import * as styles from '@/components/layout/GameLayout.css';

const FLOOR_TITLES: Record<string, string> = {
  lobby: '도서관 로비',
  myRoom: '내 서재',
  readingFloor: '독서실',
  conferenceFloor: '회의실',
  bookConcert: '북 콘서트 홀',
  bookTalkFloor: '독서 모임 공간',
};

export const GameSidebar = () => {
  const { currentFloor, setCurrentFloor } = useGameStore();
  const openModal = useModalStore((state) => state.openModal);

  const title = FLOOR_TITLES[currentFloor] || currentFloor;

  // 이동 확인 모달
  const handleMoveClick = (targetFloor: FloorType, floorTitle: string) => {
    openModal('move', {
      title: '장소 이동',
      message: `${floorTitle}로 이동하시겠습니까?`,
      onConfirm: () => {
        setCurrentFloor(targetFloor);
      },
    });
  };

  // 내 서재 사이드바
  const renderMyRoomMenu = () => (
    <div className={styles.sidebarButton}>
      {/* 도서관으로 이동 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => handleMoveClick('lobby', FLOOR_TITLES['lobby'])}
        title="도서관으로 나가기"
      >
        🚪
      </PixelButton>

      {/* 게시판 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => openModal('board')}
      >
        📋
      </PixelButton>
    </div>
  );

  // 상황별 버튼 렌더링
  const renderContextBtn = () => {
    // 열람실에서는 랭킹
    if (currentFloor === 'readingFloor') {
      return (
        <PixelButton
          variant="beige"
          shape="square"
          size="lg"
          onClick={() => openModal('rank')}
          title="랭킹 확인"
        >
          🏆
        </PixelButton>
      );
    }

    // 회의실에서는 방 목록 필요 없음
    if (currentFloor === 'conferenceFloor') {
      return null;
    }

    // 그 외에선느 방 목록
    return (
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => openModal('roomlist')}
        title="방 목록"
      >
        💬
      </PixelButton>
    );
  };

  // 도서관 사이드바
  const renderLibraryMenu = () => (
    <div className={styles.sidebarButton}>
      {/* 내 서재로 이동 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => handleMoveClick('myRoom', '나만의 서재')}
        title="내 방으로 돌아가기"
      >
        🏠
      </PixelButton>

      {/* 엘리베이터 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => openModal('elevator')}
        title="엘리베이터"
      >
        🛗
      </PixelButton>

      {/* 게시판 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => openModal('board')}
        title="게시판"
      >
        📋
      </PixelButton>

      {/* 상황에 따른 버튼 */}
      {renderContextBtn()}
    </div>
  );

  return (
    <div className={styles.sidebarMenu}>
      <h3 style={{ color: 'white' }}>{title}</h3>

      {currentFloor === 'myRoom' ? renderMyRoomMenu() : renderLibraryMenu()}

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
          onClick={() => {
            openModal('logout');
          }}
        >
          로그아웃
        </PixelButton>
      </div>
    </div>
  );
};
