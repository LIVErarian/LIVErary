export const BOOK_TALK_ZONE_IDS = ['room-1', 'room-2', 'room-3', 'room-4'] as const;

export type BookTalkZoneId = (typeof BOOK_TALK_ZONE_IDS)[number];

export const getBookTalkSlotIndex = (zoneId: string): number => {
  return BOOK_TALK_ZONE_IDS.indexOf(zoneId as BookTalkZoneId);
};

export const isBookTalkZone = (zoneId: string): boolean => {
  return getBookTalkSlotIndex(zoneId) >= 0;
};
