import { getBookTalkSlotIndex } from './bookTalkRoomSlots';

import type { RECOMMENDED_ROOM } from '@/types/entities/room.types';

/**
 * 독서 모임 공간의 zone(room-1 ~ room-4)과
 * 추천 방 배열의 인덱스를 1:1로 매핑한다.
 *
 * 예)
 * - room-1 진입 -> recommendedRooms[0]
 * - room-2 진입 -> recommendedRooms[1]
 * - room-3 진입 -> recommendedRooms[2]
 * - room-4 진입 -> recommendedRooms[3]
 */
export const findRecommendedRoomByZone = (
  zoneId: string,
  recommendedRooms: RECOMMENDED_ROOM[],
): RECOMMENDED_ROOM | null => {
  /**
   * zoneId를 "고정 슬롯 인덱스"로 변환한다.
   * - room-1 -> 0
   * - room-2 -> 1
   * - room-3 -> 2
   * - room-4 -> 3
   * 매핑 대상이 아닌 zone이면 -1을 반환한다.
   */
  const slotIndex = getBookTalkSlotIndex(zoneId);

  /**
   * room-1~4가 아닌 존은 독서모임 슬롯이 아니므로
   * 여기서 바로 null을 반환한다.
   */
  if (slotIndex < 0) return null;

  /**
   * 추천 배열 길이가 4보다 작을 수 있으므로
   * 해당 인덱스 값이 없으면 null을 반환해 상위 로직에서
   * "입장 가능한 방 없음"으로 처리할 수 있게 한다.
   */
  return recommendedRooms[slotIndex] ?? null;
};
