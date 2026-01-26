import { useGameStore } from '@/store/useGameStore';
import { CommonUI } from './common/CommonUI';
import { LobbyUI } from './LobbyUI';
import { MyRoomUI } from './MyRoomUI';

export const GameUiOverlay = () => {
  const currentFloor = useGameStore((state) => state.currentFloor);

  return (
    <>
      {/* 1. 언제나 떠있는 공통 UI */}
      <CommonUI />

      {/* 2. 방에 따라 바뀌는 UI */}
      {currentFloor === 'lobby' && <LobbyUI />}
      {currentFloor === 'myRoom' && <MyRoomUI />}
    </>
  );
};
