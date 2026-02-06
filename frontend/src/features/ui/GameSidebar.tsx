import { useState } from 'react';

import { roomApi } from '@/api/room.api';
import { PixelButton } from '@/components/common/PixelButton';
import { useNotification } from '@/hooks/queries/useNotification';
import { RemoteAudio } from '@/hooks/webrtc/RemoteAudio'; // 경로 확인 필요
import { useWebRTC } from '@/hooks/webrtc/useWebRTC';
import { useAuthStore } from '@/store/useAuthStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { useSocketStore } from '@/store/useSocketStore';

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
  const { currentFloor, setCurrentFloor, setRoomId, setSpawnPoint } =
    useGameStore();
  const user = useAuthStore((state) => state.user);
  const openModal = useModalStore((state) => state.openModal);
  const sendLeaveRoom = useSocketStore((state) => state.sendLeaveRoom);

  const roomId = useGameStore((state) => state.roomId);

  const { unreadCount } = useNotification();
  const [isMicOn, setIsMicOn] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);

  const { toggleMic, remoteStreams } = useWebRTC(
    roomId || '', // 로비에 항상 열려있는 roomId 기본 연결 필요
    user?.userId || '',
  );

  const title = FLOOR_TITLES[currentFloor] || currentFloor;

  // 마이크 버튼 클릭 로직
  const handleMicClick = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    toggleMic(nextState);
  };

  // 이동 확인 모달
  const handleMoveClick = (targetFloor: FloorType, floorTitle: string) => {
    openModal('move', {
      title: '장소 이동',
      message: `${floorTitle}로 이동하시겠습니까?`,
      onConfirm: async () => {
        if (isLeavingRoom) return;
        setIsLeavingRoom(true);
        try {
          if (currentFloor === 'conferenceFloor' && roomId) {
            // 회의실 이동 시 반드시 leaveRoom(STOMP + HTTP) 처리
            sendLeaveRoom({ roomId });
            await roomApi.leaveRoom({ roomId });
            setRoomId(null);
          }
        } catch (error: unknown) {
          console.error('회의실 퇴장 실패:', error);
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
          openModal('alert', {
            title: '오류',
            message:
              apiError?.response?.data?.message ??
              '퇴장 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
          });
          return;
        } finally {
          setIsLeavingRoom(false);
        }

        setCurrentFloor(targetFloor);
      },
    });
  };

  const handleLeaveConferenceRoom = async () => {
    if (isLeavingRoom) return;
    setIsLeavingRoom(true);

    try {
      if (roomId) {
        // 사이드바 "나가기"도 STOMP + HTTP 모두 호출
        sendLeaveRoom({ roomId });
        await roomApi.leaveRoom({ roomId });
      }

      setRoomId(null);
      setSpawnPoint({ x: 0.5, y: 0.5 });
      setCurrentFloor('bookTalkFloor');
    } catch (error: unknown) {
      console.error('회의실 퇴장 실패:', error);
      const apiError = error as {
        response?: { data?: { message?: string } };
      };
      openModal('alert', {
        title: '오류',
        message:
          apiError?.response?.data?.message ??
          '퇴장 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsLeavingRoom(false);
    }
  };

  const renderExitBtn = () => (
    <PixelButton
      variant="danger"
      shape="square"
      size="lg"
      onClick={handleLeaveConferenceRoom}
      title="회의실 나가기"
      disabled={isLeavingRoom}
    >
      {isLeavingRoom ? '...' : '🚪'}
    </PixelButton>
  );

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
        onClick={() => openModal('boardList')}
      >
        📋
      </PixelButton>

      {/* 나의 책장 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => openModal('bookshelf')}
      >
        📙
      </PixelButton>

      {/* 친구 목록 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => openModal('friendList')}
        title="친구 목록"
      >
        👥
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

    // 회의실일 때는 아무것도 보여줄 필요 없음
    else if (currentFloor !== 'conferenceFloor') {
      // 그 외에서는 방 목록
      return (
        <PixelButton
          variant="beige"
          shape="square"
          size="lg"
          onClick={() => openModal('roomList')}
          title="방 목록"
        >
          💬
        </PixelButton>
      );
    }
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
        onClick={() => openModal('boardList')}
        title="게시판"
      >
        📋
      </PixelButton>

      {/* 나의 책장 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => openModal('bookshelf')}
        title="나의 책장"
      >
        📚
      </PixelButton>

      {/* 상황에 따른 버튼 */}
      {renderContextBtn()}

      {/* 친구 목록 */}
      <PixelButton
        variant="beige"
        shape="square"
        size="lg"
        onClick={() => openModal('friendList')}
        title="친구 목록"
      >
        👥
      </PixelButton>

      {currentFloor === 'conferenceFloor' ? renderExitBtn() : null}
    </div>
  );

  return (
    <div className={styles.sidebarMenu}>
      {/* 오디오 태그 */}
      <div id="remote-streams-hidden-layer">
        {[...remoteStreams.entries()].map(([userId, stream]) => (
          <RemoteAudio key={userId} userId={userId} stream={stream} />
        ))}
      </div>

      <h3 style={{ color: 'white' }}>{title}</h3>

      {currentFloor === 'myRoom' ? renderMyRoomMenu() : renderLibraryMenu()}

      {/* 프로필 및 설정 */}
      <div className={styles.profileSection}>
        {/* 플레이어 정보 */}
        <button
          className={styles.profileRow}
          onClick={() => openModal('profile')}
        >
          <div className={styles.avatarCircle} />
          <span className={styles.playerName}>{user?.nickname}</span>
        </button>

        <div className={styles.mediaRow}>
          <div style={{ position: 'relative' }}>
            <PixelButton
              variant="beige"
              shape="circle"
              size="sm"
              onClick={() => openModal('notification')}
            >
              🔔
            </PixelButton>
            {unreadCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
          <PixelButton
            variant={isMicOn ? 'primary' : 'beige'}
            shape="circle"
            size="sm"
            onClick={handleMicClick}
          >
            {isMicOn ? '🔊' : '🔇'}
          </PixelButton>
        </div>

        <PixelButton
          variant="danger"
          fullWidth
          onClick={() => openModal('logout')}
        >
          로그아웃
        </PixelButton>
      </div>
    </div>
  );
};
