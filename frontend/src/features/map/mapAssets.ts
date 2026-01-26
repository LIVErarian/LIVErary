import bookConcertImg from '@/assets/maps/book_concert_floor.png';
import booktalkFloorImg from '@/assets/maps/booktalk_floor.png';
import conferenceFloorImg from '@/assets/maps/conference_floor.png';
import lobbyImg from '@/assets/maps/lobby_floor.png';
import myRoomImg from '@/assets/maps/my_room.png';
import readingFloorImg from '@/assets/maps/reading_floor.png';

import type { FloorType } from '@/types/map.types';

type MapDataProps = {
  img: string;
  width?: number;
  height?: number;
};

export const MAP_DATA: Record<FloorType, MapDataProps> = {
  lobby: {
    img: lobbyImg,
  },
  readingFloor: {
    img: readingFloorImg,
  },
  conferenceFloor: {
    img: conferenceFloorImg,
  },
  bookTalkFloor: {
    img: booktalkFloorImg,
  },
  bookConcert: {
    img: bookConcertImg,
  },
  myRoom: {
    img: myRoomImg,
    width: 1920,
    height: 1080,
  },
};
