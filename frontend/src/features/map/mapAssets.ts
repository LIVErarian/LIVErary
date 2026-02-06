import type {
  FloorType,
  MapCollisionConfig,
  MapConfig,
} from '@/types/map.types';

// Tiled Map JSON 데이터의 타입 정의
type TiledLayer = {
  name?: string;
  type?: string;
  data?: number[];
};

export type TiledMap = {
  width?: number;
  height?: number;
  tilewidth?: number;
  tileheight?: number;
  layers?: TiledLayer[];
};

// 충돌 계산 로직

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

const COLLISION_LAYERS = ['WALL', 'OBJECT', 'BOOKSHELF'];

/**
 * 맵 데이터(JSON)를 받아서 충돌 영역과 크기를 계산해주는 함수
 */
export const getMapProps = (mapData: TiledMap | null) => {
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

// 맵 설정 데이터

export const CATEGORY_MAP: Record<string, string> = {
  'f92eb0f2-a547-4004-80d6-5310c7731595': 'science',
  '84ed26a7-9eff-436e-b8ad-f40051b0e674': 'comic',
};

export const MAP_DATA: Record<FloorType, MapConfig> = {
  lobby: {
    floorId: '11111111-1111-1111-1111-111111111111',
    defaultRoomId: 'lobby-channel-uuid',
    name: '도서관 로비',
    imgAlias: 'lobby',
    jsonAlias: 'lobbyTmj',
    zones: [
      {
        id: 'lobby-board-left',
        label: '왼쪽 게시판',
        x: 0.715,
        y: 0.19,
        width: 0.068,
        height: 0.12,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'boardList',
        },
      },
      {
        id: 'lobby-board-right',
        label: '오른쪽 게시판',
        x: 0.815,
        y: 0.19,
        width: 0.068,
        height: 0.12,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'boardList',
        },
      },
      {
        id: 'lobby-elevator',
        label: '로비층 엘레베이터',
        x: 0.32,
        y: 0.175,
        width: 0.115,
        height: 0.095,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'elevator',
        },
      },
      {
        id: 'lobby-librarian',
        label: '로비 사서',
        x: 0.45,
        y: 0.57,
        width: 0.06,
        height: 0.09,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'roomList',
        },
      },
      {
        id: 'lobby-search',
        label: '로비 도서검색대',
        x: 0.55,
        y: 0.57,
        width: 0.06,
        height: 0.09,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'bookSearch',
        },
      },
      {
        id: 'lobby-exit',
        label: '로비 퇴장 - 마이룸',
        x: 0.35,
        y: 0.9,
        width: 0.3,
        height: 0.1,
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
    defaultRoomId: 'reading-floor-uuid',
    name: '독서실',
    imgAlias: 'readingFloor',
    jsonAlias: 'readingFloorTmj',
    zones: [
      {
        id: 'reading-elevator',
        label: '독서실 엘레베이터',
        x: 0.32,
        y: 0.175,
        width: 0.115,
        height: 0.095,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'elevator',
        },
      },
      {
        id: 'reading-librarian',
        label: '독서실 사서',
        x: 0.45,
        y: 0.57,
        width: 0.06,
        height: 0.09,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'roomList',
        },
      },
      {
        id: 'reading-search',
        label: '독서실 도서검색대',
        x: 0.55,
        y: 0.57,
        width: 0.06,
        height: 0.09,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'bookSearch',
        },
      },
      {
        id: 'trophie',
        label: '독서 랭킹 확인 ',
        x: 0.34,
        y: 0.35,
        width: 0.085,
        height: 0.105,
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
    defaultRoomId: 'conference-floor-uuid',
    name: '회의실',
    imgAlias: 'conference',
    jsonAlias: 'conferenceTmj',
    zones: [
      {
        id: 'conference-exit',
        label: '회의실 퇴장',
        x: 0.93,
        y: 0.48,
        width: 0.07,
        height: 0.09,
        trigger: 'interact',
        action: {
          type: 'leaveRoomConfirm',
          title: '퇴장 확인',
          message: '퇴장하시겠습니까?',
        },
      },
    ],
  },
  bookTalkFloor: {
    floorId: '33333333-3333-3333-3333-333333333333',
    defaultRoomId: null,
    name: '독서 모임 공간',
    imgAlias: 'bookTalkBasic',
    jsonAlias: 'bookTalkTmj',
    categoryImgAliases: {
      science: 'bookTalkScience',
      comic: 'bookTalkComic',
    },
    zones: [
      {
        id: 'room-1',
        label: '왼쪽 상단 룸',
        x: 0.03,
        y: 0.03,
        width: 0.28,
        height: 0.45,
        trigger: 'enter',
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontBelow',
        },
      },
      {
        id: 'room-2',
        label: '오른쪽 상단 룸',
        x: 0.69,
        y: 0.03,
        width: 0.28,
        height: 0.45,
        trigger: 'enter',
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontBelow',
        },
      },
      {
        id: 'room-3',
        label: '왼쪽 하단 룸',
        x: 0.03,
        y: 0.7,
        width: 0.28,
        height: 0.28,
        trigger: 'enter',
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontAbove',
        },
      },
      {
        id: 'room-4',
        label: '오른쪽 하단 룸',
        x: 0.69,
        y: 0.7,
        width: 0.28,
        height: 0.28,
        trigger: 'enter',
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontAbove',
        },
      },
      {
        id: 'talk-elevator',
        label: '독서 모임 공간 엘레베이터',
        x: 0.32,
        y: 0.175,
        width: 0.115,
        height: 0.095,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'elevator',
        },
      },
      {
        id: 'talk-librarian',
        label: '독서모임 사서',
        x: 0.45,
        y: 0.365,
        width: 0.06,
        height: 0.09,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'roomList',
        },
      },
      {
        id: 'talk-search',
        label: '독서모임 도서검색대',
        x: 0.55,
        y: 0.365,
        width: 0.06,
        height: 0.09,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'bookSearch',
        },
      },
    ],
  },
  bookConcert: {
    floorId: '44444444-4444-4444-4444-444444444444',
    defaultRoomId: 'book-concert-uuid',
    name: '북 콘서트 홀',
    imgAlias: 'bookConcert',
    jsonAlias: 'bookConcertTmj',
    zones: [
      {
        id: 'concert-whiteboard',
        label: '북 콘서트 빔 프로젝트',
        x: 0.37,
        y: 0.17,
        width: 0.265,
        height: 0.16,
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
        x: 0.35,
        y: 0.9,
        width: 0.3,
        height: 0.1,
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
    imgAlias: 'myRoom',
    // myRoom은 JSON 맵 데이터가 없으므로 jsonAlias 생략
    zones: [
      {
        id: 'myRoom-bookshelf-left',
        label: '왼쪽 책장',
        x: 0.005,
        y: 0.07,
        width: 0.16,
        height: 0.5,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'bookshelf',
        },
      },
      {
        id: 'myRoom-bookshelf-right',
        label: '오른쪽 책장',
        x: 0.84,
        y: 0.07,
        width: 0.16,
        height: 0.5,
        trigger: 'interact',
        action: {
          type: 'openModal',
          modalType: 'bookshelf',
        },
      },
    ],
  },
};
