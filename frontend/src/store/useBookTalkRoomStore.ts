import { create } from 'zustand';

import type { RECOMMENDED_ROOM } from '@/types/entities/room.types';

interface BookTalkRoomState {
  /**
   * 현재 드롭다운 선택 카테고리.
   * 빈 문자열('')은 "전체" 옵션을 의미한다.
   * 실제 API 호출 시에는 undefined로 변환해서 전달한다.
   */
  selectedCategoryId: string;

  /**
   * /ai/recommend 응답 원본 배열.
   * room-1~4 배정은 배열 인덱스를 그대로 사용한다.
   */
  recommendedRooms: RECOMMENDED_ROOM[];

  /**
   * room-4 전용 방 정보 (방 생성 후 업데이트).
   */
  room4Room: RECOMMENDED_ROOM | null;

  /**
   * 드롭다운에서 사용자가 현재 고른 카테고리 ID.
   * 빈 문자열('')은 "전체"를 의미한다.
   */
  setSelectedCategoryId: (categoryId: string) => void;

  /**
   * /ai/recommend 응답 원본 배열을 그대로 저장한다.
   * zone과 room 매핑은 별도 유틸에서 인덱스 기반으로 처리한다.
   */
  setRecommendedRooms: (rooms: RECOMMENDED_ROOM[]) => void;

  setRoom4Room: (room: RECOMMENDED_ROOM | null) => void;

  // room-4를 항상 빈 상태로 되돌릴 때 사용
  clearRoom4Room: () => void;

  clearRecommendedRooms: () => void;
}

export const useBookTalkRoomStore = create<BookTalkRoomState>((set) => ({
  // 초기 진입 시 "전체" 카테고리 상태
  selectedCategoryId: '',
  // 추천 방을 아직 받지 못한 초기 상태
  recommendedRooms: [],
  room4Room: null,

  // 드롭다운에서 선택한 카테고리를 그대로 저장한다.
  setSelectedCategoryId: (categoryId) =>
    set({ selectedCategoryId: categoryId }),
  // 최신 추천 방 배열 전체를 교체 저장한다.
  setRecommendedRooms: (rooms) => set({ recommendedRooms: rooms }),
  setRoom4Room: (room) => set({ room4Room: room }),
  clearRoom4Room: () => set({ room4Room: null }),
  // 3층 이탈/비활성 시 이전 추천 방 잔존을 막기 위해 초기화한다.
  clearRecommendedRooms: () => set({ recommendedRooms: [] }),
}));
