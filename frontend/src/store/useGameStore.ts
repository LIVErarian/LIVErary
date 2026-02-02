import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FloorType } from '@/types/map.types';

interface GameState {
  currentFloor: FloorType;
  setCurrentFloor: (floor: FloorType) => void;
}

export const useGameStore = create(
  persist<GameState>(
    (set) => ({
      currentFloor: 'myRoom', // 기본값 마이룸
      setCurrentFloor: (floor: FloorType) => set({ currentFloor: floor }),
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
