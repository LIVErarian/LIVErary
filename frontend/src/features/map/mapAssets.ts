import bookConcertImg from '@/assets/maps/book_concert_floor.png';
import booktalkFloorImg from '@/assets/maps/booktalk_floor.png';
import conferenceFloorImg from '@/assets/maps/conference_floor.png';
import lobbyImg from '@/assets/maps/lobby_floor.png';
import myRoomImg from '@/assets/maps/my_room.png';
import readingFloorImg from '@/assets/maps/reading_floor.png';

import type { FloorType, MapConfig } from '@/types/map.types';

export const MAP_DATA: Record<FloorType, MapConfig> = {
  lobby: {
    floorId: '11111111-1111-1111-1111-111111111111',
    name: '도서관 로비',
    img: lobbyImg,
  },
  readingFloor: {
    floorId: '22222222-2222-2222-2222-222222222222',
    name: '독서실',
    img: readingFloorImg,
  },
  conferenceFloor: {
    floorId: '55555555-5555-5555-5555-555555555555',
    name: '회의실',
    img: conferenceFloorImg,
  },
  bookTalkFloor: {
    floorId: '33333333-3333-3333-3333-333333333333',
    name: '독서 모임 공간',
    img: booktalkFloorImg,
  },
  bookConcert: {
    floorId: '44444444-4444-4444-4444-444444444444',
    name: '북 콘서트 홀',
    img: bookConcertImg,
  },
  myRoom: {
    floorId: '00000000-0000-0000-0000-000000000000',
    name: '내 서재',
    img: myRoomImg,
  },
};
