import { useEffect, useRef } from 'react';

import { GameLayout } from '@/components/layout/GameLayout';
import { GameChatWidget } from '@/features/chat/GameChatWidget';
import {
  CATEGORY_MAP,
  FAIRY_PLAYLIST,
  MAP_DATA,
  SF_PLAYLIST,
} from '@/game/map/mapAssets';
import { BookTalkCategoryDropdown } from '@/game/ui/BookTalkCategoryDropdown';
import { ConferenceRoomInfoPanel } from '@/game/ui/ConferenceRoomInfoPanel';
import { GameSidebar } from '@/game/ui/GameSidebar';
import { useReadingTimer } from '@/services/queries/useReadingTimer';
import { useRecommendedRooms } from '@/services/queries/useRoomQueries';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { useReadingStore } from '@/store/useReadingStore';
import { useSocketStore } from '@/store/useSocketStore';
import { useSoundStore } from '@/store/useSoundStore';
import { useGame } from './useGame';

import * as styles from '@/components/layout/GameLayout.css';

export const GameContent = () => {
  useReadingTimer(); // 독서 타이머 로직 활성화 (UI 없음)
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFloorRef = useRef<string | null>(null);
  const wasConnectedRef = useRef<boolean>(false); // 소켓 연결 상태 추적

  const { gameAppRef, isReady } = useGame(containerRef);

  const currentFloor = useGameStore((state) => state.currentFloor);
  const spawnPoint = useGameStore((state) => state.spawnPoint);
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);

  const clearRoom4Room = useBookTalkRoomStore((state) => state.clearRoom4Room);
  const setRecommendedRooms = useBookTalkRoomStore(
    (state) => state.setRecommendedRooms,
  );

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const { playPlaylist, stopBGM } = useSoundStore();
  const currentBook = useReadingStore((state) => state.currentBook);

  const selectedCategoryId = useBookTalkRoomStore(
    (state) => state.selectedCategoryId,
  );

  const { data: latestRooms } = useRecommendedRooms(
    selectedCategoryId,
    currentFloor === 'bookTalkFloor',
  );

  const { connect, disconnect, isConnected } = useSocketStore();
  const { openModal } = useModalStore();

  useEffect(() => {
    if (!latestRooms || !gameAppRef.current || currentFloor !== 'bookTalkFloor')
      return;

    // 받아온 최신 데이터 업데이트
    setRecommendedRooms(latestRooms);

    gameAppRef.current.refreshBookTalkRoomInfoOverlay();
  });

  /**
   * 게임 화면에서 소켓 연결을 유지한다.
   * 단, accessToken이 아직 복원되지 않은 시점에는 connect를 호출하지 않는다.
   * (초기 렌더 타이밍의 토큰 null 상태에서 connect를 먼저 치면
   *  헤더 없는 연결 시도로 실패하고 이후 재시도가 누락될 수 있음)
   */
  useEffect(() => {
    if (!accessToken) return;
    connect();
  }, [accessToken, connect]);

  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (navEntry?.type === 'reload') {
      // 1. 방 ID와 스폰 포인트는 어디에 있든 일단 초기화 (안전장치)
      setRoomId(null);
      setSpawnPoint(null);

      // 현재 위치가 'conferenceFloor'(회의실)일 때만 'bookTalkFloor'로 강제 이동
      if (currentFloor === 'conferenceFloor') {
        setCurrentFloor('bookTalkFloor');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentFloor, setRoomId, setSpawnPoint]);

  useEffect(() => {
    /**
     * 소켓 연결 해제는 페이지 이탈(언마운트) 시점에만 수행한다.
     * 토큰 상태 변화와 연결 해제를 묶지 않아서 불필요한 연결 흔들림을 줄인다.
     */
    return () => disconnect();
  }, [disconnect]);

  // 로그인 후 받은 유저 preferences 값이 null이거나 빈 배열이면 선호 카테고리 모달을 노출한다.
  useEffect(() => {
    if (!user) return;
    if (user.preferences !== null && user.preferences.length > 0) return;

    openModal('preferences');
  }, [openModal, user]);

  /**
   * PixiJS가 준비된 후 층 변경 감지
   */
  useEffect(() => {
    if (gameAppRef.current && currentFloor && isReady) {
      const isSameFloor = lastFloorRef.current === currentFloor;
      const hasSpawnPoint = !!spawnPoint;

      // 소켓 연결 상태가 변했다면 재실행
      const isSocketStatusChanged = wasConnectedRef.current !== isConnected;

      if (isSameFloor && !hasSpawnPoint && !isSocketStatusChanged) return;

      /**
       * 독서 모임 공간(bookTalkFloor)은 "존 입장 시점"에만 room join을 허용한다.
       * 이전 층/세션에서 남아 있던 roomId로 자동 RTC 재입장이 발생하지 않도록
       * 층 전환 직후 roomId를 초기화한다.
       *
       * 결과적으로 동작 순서는 다음과 같다.
       * 1) 3층 도착 직후: roomId = null (RTC join 없음)
       * 2) room-1~4 zone 확인 입장: GameApp에서 REST join + roomId 세팅
       * 3) roomId 세팅 이후에만 useWebRTC가 시그널링 join 진행
       */
      if (!isSameFloor && currentFloor === 'bookTalkFloor') {
        setRoomId(null);
        // bookTalkFloor 재진입 시 room-4는 항상 비움
        clearRoom4Room();
      }

      console.log(
        `층 변경/이동 시도: ${currentFloor} (Spawn: ${hasSpawnPoint})`,
      );
      gameAppRef.current.changeMap(currentFloor);

      // 층이 변경되면 lastFloorRef 업데이트
      lastFloorRef.current = currentFloor;
    }
  }, [
    currentFloor,
    spawnPoint,
    gameAppRef,
    isReady,
    isConnected,
    setRoomId,
    clearRoom4Room,
  ]);

  /**
   * 카테고리 변경 감지
   */
  useEffect(() => {
    if (isReady && gameAppRef.current) {
      const mappedKey = CATEGORY_MAP[selectedCategoryId] || '';

      console.log(`[GamePage] 변환: ${selectedCategoryId} -> ${mappedKey}`);
      gameAppRef.current.updateBackground(mappedKey);
    }
  }, [selectedCategoryId, isReady, gameAppRef]);

  /**
   * 층 이동 & 독서 상태에 따른 음악 재생
   */
  useEffect(() => {
    if (!currentFloor) return;

    let targetPlaylist: string[] = [];

    // 독서실 + 책 카테고리
    if (currentFloor === 'readingFloor' && currentBook?.category) {
      const category = currentBook.category;
      if (category === '과학') {
        targetPlaylist = SF_PLAYLIST;
      } else if (category === '유아' || category === '어린이') {
        targetPlaylist = FAIRY_PLAYLIST;
      } else {
        targetPlaylist = MAP_DATA['readingFloor'].bgm || [];
      }
    }
    // 일반 층 이동
    else {
      const mapConfig = MAP_DATA[currentFloor];
      targetPlaylist = mapConfig?.bgm || [];
    }

    // 플레이리스트 넘기기
    if (targetPlaylist.length > 0) {
      playPlaylist(targetPlaylist);
    } else {
      stopBGM();
    }
  }, [currentFloor, currentBook, playPlaylist, stopBGM]);
  return (
    <GameLayout canvasRef={containerRef} sideMenu={<GameSidebar />}>
      <BookTalkCategoryDropdown />
      <ConferenceRoomInfoPanel />
      <div className={styles.interactive}>
        <GameChatWidget />
      </div>
    </GameLayout>
  );
};
