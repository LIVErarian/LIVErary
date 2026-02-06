import { useEffect, useRef } from 'react';

import { GameLayout } from '@/components/layout/GameLayout';
import { useGame } from '@/features/core/useGame';
import { CATEGORY_MAP } from '@/features/map/mapAssets';
import { BookTalkCategoryDropdown } from '@/features/ui/BookTalkCategoryDropdown';
import { ConferenceRoomInfoPanel } from '@/features/ui/ConferenceRoomInfoPanel';
import { GameSidebar } from '@/features/ui/GameSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { useSocketStore } from '@/store/useSocketStore';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFloorRef = useRef<string | null>(null);

  const { gameAppRef, isReady } = useGame(containerRef);

  const currentFloor = useGameStore((state) => state.currentFloor);
  const spawnPoint = useGameStore((state) => state.spawnPoint);
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);
  const clearRoom4Room = useBookTalkRoomStore((state) => state.clearRoom4Room);

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const selectedCategoryId = useBookTalkRoomStore(
    (state) => state.selectedCategoryId,
  );

  const { connect, disconnect } = useSocketStore();
  const { openModal } = useModalStore();

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

      if (isSameFloor && !hasSpawnPoint) return;

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

  return (
    <GameLayout canvasRef={containerRef} sideMenu={<GameSidebar />}>
      <BookTalkCategoryDropdown />
      <ConferenceRoomInfoPanel />
    </GameLayout>
  );
};
