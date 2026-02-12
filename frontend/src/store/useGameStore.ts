import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FloorType } from '@/types/game/map.types';

interface GameState {
  currentFloor: FloorType;
  roomId: string | null;
  spawnPoint: { x: number; y: number } | null;
  roomCode: string | null;

  setCurrentFloor: (floor: FloorType) => void;
  setRoomId: (id: string | null) => void;
  setSpawnPoint: (point: { x: number; y: number } | null) => void;
  setRoomCode: (code: string | null) => void;
}

export const useGameStore = create(
  persist<GameState>(
    (set) => ({
      currentFloor: 'myRoom', // 기본값 마이룸
      roomId: null,
      spawnPoint: null,
      roomCode: null,

      setCurrentFloor: (floor: FloorType) => set({ currentFloor: floor }),
      setRoomId: (id: string | null) => set({ roomId: id }),
      setSpawnPoint: (point) => set({ spawnPoint: point }),
      setRoomCode: (code) => set({ roomCode: code }),
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
