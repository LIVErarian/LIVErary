import bookConcertMapRaw from '@/assets/maps/book_concert.tmj?raw';
import bookConcertImg from '@/assets/maps/book_concert_floor.png';
import bookTalkMapRaw from '@/assets/maps/book_talk_floor.tmj?raw';
import booktalkFloorImg from '@/assets/maps/booktalk_floor.png';
import conferenceFloorImg from '@/assets/maps/conference_floor.png';
import conferenceMapRaw from '@/assets/maps/conference_floor.tmj?raw';
import lobbyMapRaw from '@/assets/maps/lobby.tmj?raw';
import lobbyImg from '@/assets/maps/lobby_floor.png';
import myRoomImg from '@/assets/maps/my_room.png';
import readingFloorImg from '@/assets/maps/reading_floor.png';
import readingMapRaw from '@/assets/maps/reading_floor.tmj?raw';

import type {
  FloorType,
  MapCollisionConfig,
  MapConfig,
} from '@/types/map.types';

type TiledLayer = {
  name?: string;
  type?: string;
  data?: number[];
};

type TiledMap = {
  width?: number;
  height?: number;
  tilewidth?: number;
  tileheight?: number;
  layers?: TiledLayer[];
};

const buildLayerCollision = (
  mapData: TiledMap,
  layerName: string,
): MapCollisionConfig | null => {
  const layers = mapData.layers ?? [];
  const layer = layers.find(
    (entry) => entry?.type === 'tilelayer' && entry?.name === layerName,
  );
  const data = layer?.data ?? [];

  if (
    !mapData.width ||
    !mapData.height ||
    !mapData.tilewidth ||
    !mapData.tileheight
  ) {
    return null;
  }

  if (data.length !== mapData.width * mapData.height) {
    return null;
  }

  return {
    tileWidth: mapData.tilewidth,
    tileHeight: mapData.tileheight,
    width: mapData.width,
    height: mapData.height,
    grid: data.map((tileId) => (tileId && tileId !== 0 ? 1 : 0)),
  };
};

const mergeCollisionGrids = (
  width: number,
  height: number,
  grids: Array<number[]>,
) => {
  const size = width * height;
  const merged = new Array<number>(size).fill(0);
  grids.forEach((grid) => {
    for (let i = 0; i < size; i += 1) {
      if (grid[i] === 1) merged[i] = 1;
    }
  });
  return merged;
};

const buildCollisionFromLayers = (
  mapData: TiledMap,
  layerNames: string[],
): MapCollisionConfig | null => {
  if (!mapData.width || !mapData.height) return null;

  const collisions = layerNames
    .map((layerName) => buildLayerCollision(mapData, layerName))
    .filter((collision): collision is MapCollisionConfig => Boolean(collision));

  if (collisions.length === 0) return null;

  return {
    ...collisions[0],
    grid: mergeCollisionGrids(
      collisions[0].width,
      collisions[0].height,
      collisions.map((collision) => collision.grid),
    ),
  };
};

const parseTiledMap = (raw: string, label: string): TiledMap | null => {
  try {
    return JSON.parse(raw) as TiledMap;
  } catch (error) {
    console.error(`[mapAssets] failed to parse ${label}`, error);
    return null;
  }
};

const COLLISION_LAYERS = ['WALL', 'OBJECT', 'BOOKSHELF'];

const getMapProps = (mapData: TiledMap | null) => {
  if (!mapData?.width || !mapData?.height) return {};

  const width =
    mapData.tilewidth && mapData.width
      ? mapData.width * mapData.tilewidth
      : undefined;
  const height =
    mapData.tileheight && mapData.height
      ? mapData.height * mapData.tileheight
      : undefined;
  const collision = mapData
    ? buildCollisionFromLayers(mapData, COLLISION_LAYERS)
    : null;

  return {
    width,
    height,
    collision: collision ?? undefined,
  };
};

const lobbyMap = parseTiledMap(lobbyMapRaw, 'lobby.tmj');
const readingMap = parseTiledMap(readingMapRaw, 'reading_floor.tmj');
const conferenceMap = parseTiledMap(conferenceMapRaw, 'conference_floor.tmj');
const bookTalkMap = parseTiledMap(bookTalkMapRaw, 'book_talk_floor.tmj');
const bookConcertMap = parseTiledMap(bookConcertMapRaw, 'book_concert.tmj');

const lobbyMapProps = getMapProps(lobbyMap);
const readingMapProps = getMapProps(readingMap);
const conferenceMapProps = getMapProps(conferenceMap);
const bookTalkMapProps = getMapProps(bookTalkMap);
const bookConcertMapProps = getMapProps(bookConcertMap);

export const MAP_DATA: Record<FloorType, MapConfig> = {
  lobby: {
    floorId: '11111111-1111-1111-1111-111111111111',
    name: '도서관 로비',
    img: lobbyImg,
    ...lobbyMapProps,
    zones: [
      {
        id: 'lobby-board-left',
        label: '왼쪽 게시판',
        x: 0.715,
        y: 0.135,
        width: 0.068,
        height: 0.12,
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
      {
        id: 'lobby-board-right',
        label: '오른쪽 게시판',
        x: 0.815,
        y: 0.135,
        width: 0.068,
        height: 0.12,
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
      {
        id: 'lobby-elevator',
        label: '로비층 엘레베이터',
        x: 0.35,
        y: 0.125,
        width: 0.04,
        height: 0.075,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'elevator',
        },
      },
      {
        id: 'lobby-board-center',
        label: '중앙 게시판',
        x: 0.465,
        y: 0.23,
        width: 0.103,
        height: 0.085,
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
    ],
  },
  readingFloor: {
    floorId: '22222222-2222-2222-2222-222222222222',
    name: '독서실',
    img: readingFloorImg,
    ...readingMapProps,
    zones: [
      {
        id: 'reading-elevator',
        label: '독서실 엘레베이터',
        x: 0.35,
        y: 0.125,
        width: 0.04,
        height: 0.075,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'elevator',
        },
      },
      {
        id: 'reading-board-center',
        label: '독서실 중앙 게시판',
        x: 0.465,
        y: 0.23,
        width: 0.103,
        height: 0.085,
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
    ],
  },
  conferenceFloor: {
    floorId: '55555555-5555-5555-5555-555555555555',
    name: '회의실',
    img: conferenceFloorImg,
    ...conferenceMapProps,
  },
  bookTalkFloor: {
    floorId: '33333333-3333-3333-3333-333333333333',
    name: '독서 모임 공간',
    img: booktalkFloorImg,
    ...bookTalkMapProps,
    zones: [
      {
        id: 'room-1',
        label: '왼쪽 상단 룸',
        x: 0.025,
        y: 0.03,
        width: 0.31,
        height: 0.46,
        trigger: ['enter', 'exit'],
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontBelow',
        },
        exitAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '퇴장하시겠습니까?',
          confirmPosition: 'zoneFrontBelow',
          cancelPosition: 'zoneCenter',
        },
      },
      {
        id: 'room-2',
        label: '오른쪽 상단 룸',
        x: 0.665,
        y: 0.03,
        width: 0.31,
        height: 0.46,
        trigger: ['enter', 'exit'],
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontBelow',
        },
        exitAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '퇴장하시겠습니까?',
          confirmPosition: 'zoneFrontBelow',
          cancelPosition: 'zoneCenter',
        },
      },
      {
        id: 'room-3',
        label: '왼쪽 하단 룸',
        x: 0.025,
        y: 0.6,
        width: 0.31,
        height: 0.36,
        trigger: ['enter', 'exit'],
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontAbove',
        },
        exitAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '퇴장하시겠습니까?',
          confirmPosition: 'zoneFrontAbove',
          cancelPosition: 'zoneCenter',
        },
      },
      {
        id: 'room-4',
        label: '오른쪽 하단 룸',
        x: 0.665,
        y: 0.6,
        width: 0.31,
        height: 0.36,
        trigger: ['enter', 'exit'],
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontAbove',
        },
        exitAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '퇴장하시겠습니까?',
          confirmPosition: 'zoneFrontAbove',
          cancelPosition: 'zoneCenter',
        },
      },
      {
        id: 'talk-elevator',
        label: '독서 모임 공간 엘레베이터',
        x: 0.35,
        y: 0.125,
        width: 0.04,
        height: 0.075,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'elevator',
        },
      },
      {
        id: 'talk-board-center',
        label: '독서 모임 공간 중앙 게시판',
        x: 0.465,
        y: 0.08,
        width: 0.103,
        height: 0.085,
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
    ],
  },
  bookConcert: {
    floorId: '44444444-4444-4444-4444-444444444444',
    name: '북 콘서트 홀',
    img: bookConcertImg,
    ...bookConcertMapProps,
    zones: [
      {
        id: 'concert-whiteboard',
        label: '북 콘서트 빔 프로젝트',
        x: 0.44,
        y: 0.07,
        width: 0.12,
        height: 0.085,
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
      {
        id: 'concert-exit',
        label: '콘서트 퇴장 - 엘레베이터',
        x: 0.0,
        y: 0.8,
        width: 1.0,
        height: 0.2,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'elevator',
        },
      },
    ],
  },
  myRoom: {
    floorId: '00000000-0000-0000-0000-000000000000',
    name: '내 서재',
    img: myRoomImg,
    zones: [
      {
        id: 'myRoom-bookshelf-left',
        label: '왼쪽 책장',
        x: 0.005,
        y: 0.07,
        width: 0.155,
        height: 0.4,
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
      {
        id: 'myRoom-bookshelf-right',
        label: '오른쪽 책장',
        x: 0.84,
        y: 0.07,
        width: 0.155,
        height: 0.4,
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
    ],
  },
};
