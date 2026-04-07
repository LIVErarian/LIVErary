import type { FloorType, MapConfig } from '@/types/game/map.types';

// PLAYLISTS
export const READING_PLAYLIST = [
  'calm_1',
  'calm_2',
  'calm_3',
  'calm_4',
  'calm_5',
  'rain_1',
];

export const EXTRA_PLAYLIST = ['cafe_1', 'arabian_1'];

export const ROMANCE_PLYALIST = ['romantic_1', 'romantic_2'];

export const FAIRY_PLAYLIST = [
  'fairy_1',
  'fairy_2',
  'fairy_3',
  'fairy_4',
  'fairy_5',
  'fairy_6',
];

export const SF_PLAYLIST = ['sf_1', 'alternative_1'];

// MAP CONFIGURATION
export const CATEGORY_MAP: Record<string, string> = {
  'f92eb0f2-a547-4004-80d6-5310c7731595': 'science',
  '84ed26a7-9eff-436e-b8ad-f40051b0e674': 'comic',
};

export const MAP_DATA: Record<FloorType, MapConfig> = {
  // 도서관 로비
  lobby: {
    floorId: '11111111-1111-1111-1111-111111111111',
    defaultRoomId: 'lobby-channel-uuid',
    name: '도서관 로비',
    imgAlias: 'lobby',
    jsonAlias: 'lobbyTmj',
    bgm: [
      ...EXTRA_PLAYLIST,
      ...READING_PLAYLIST,
      ...SF_PLAYLIST,
      ...FAIRY_PLAYLIST,
      ...ROMANCE_PLYALIST,
    ],
    zones: {
      'lobby-board-left': {
        label: '왼쪽 게시판',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'boardList' },
      },
      'lobby-board-right': {
        label: '오른쪽 게시판',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'boardList' },
      },
      'lobby-elevator': {
        label: '로비층 엘레베이터',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'elevator' },
      },
      'lobby-librarian': {
        label: '로비 사서',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'roomList' },
      },
      'lobby-search': {
        label: '로비 도서검색대',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'bookSearch' },
      },
      'lobby-exit': {
        label: '로비 퇴장 - 마이룸',
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
      'random-quote': {
        label: '오늘의 문장',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'quote' },
      },
      'lobby-rank': {
        label: '독서 랭킹 확인',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'rank' },
      },
    },
  },

  // 독서실 (Reading Floor)
  readingFloor: {
    floorId: '22222222-2222-2222-2222-222222222222',
    defaultRoomId: 'reading-floor-uuid',
    name: '독서실',
    imgAlias: 'readingFloor',
    jsonAlias: 'readingFloorTmj',
    bgm: [
      ...READING_PLAYLIST,
      ...SF_PLAYLIST,
      ...FAIRY_PLAYLIST,
      ...ROMANCE_PLYALIST,
    ],
    zones: {
      'reading-elevator': {
        label: '독서실 엘레베이터',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'elevator' },
      },
      'reading-librarian': {
        label: '독서실 사서',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'roomList' },
      },
      'reading-search': {
        label: '독서실 도서검색대',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'bookSearch' },
      },
      trophie: {
        label: '독서 랭킹 확인',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'rank' },
      },
      'reading-concentration': {
        label: '집중 모드 시작',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'concentration' },
      },
    },
  },

  // 회의실 (Conference Floor)
  conferenceFloor: {
    floorId: '55555555-5555-5555-5555-555555555555',
    defaultRoomId: 'conference-floor-uuid',
    name: '회의실',
    imgAlias: 'conference',
    jsonAlias: 'conferenceTmj',
    zones: {
      'conference-exit': {
        label: '회의실 퇴장',
        trigger: 'interact',
        action: {
          type: 'leaveRoomConfirm',
          title: '퇴장 확인',
          message: '퇴장하시겠습니까?',
        },
      },
      'conference-search': {
        label: '회의실 도서검색대',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'bookSearch' },
      },
      'conference-book-change': {
        label: '회의실 책 교체',
        trigger: 'interact',
      },
      'conference-return': {
        label: '회의실 복귀',
        trigger: 'interact',
      },
    },
  },

  // 독서 모임 (Book Talk Floor)
  bookTalkFloor: {
    floorId: '33333333-3333-3333-3333-333333333333',
    defaultRoomId: null,
    name: '독서 모임',
    imgAlias: 'bookTalkBasic',
    jsonAlias: 'bookTalkTmj',
    bgm: [
      ...EXTRA_PLAYLIST,
      ...READING_PLAYLIST,
      ...SF_PLAYLIST,
      ...FAIRY_PLAYLIST,
      ...ROMANCE_PLYALIST,
    ],
    categoryImgAliases: {
      science: 'bookTalkScience',
      comic: 'bookTalkComic',
    },
    zones: {
      'room-1': {
        label: '왼쪽 상단 룸',
        trigger: 'enter',
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontBelow',
        },
      },
      'room-2': {
        label: '오른쪽 상단 룸',
        trigger: 'enter',
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontBelow',
        },
      },
      'room-3': {
        label: '왼쪽 하단 룸',
        trigger: 'enter',
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontAbove',
        },
      },
      'room-4': {
        label: '오른쪽 하단 룸',
        trigger: 'enter',
        enterAction: {
          type: 'confirmReposition',
          title: '장소 이동',
          message: '입장하시겠습니까?',
          confirmPosition: 'zoneCenter',
          cancelPosition: 'zoneFrontAbove',
        },
      },
      'talk-elevator': {
        label: '독서 모임 공간 엘레베이터',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'elevator' },
      },
      'talk-librarian': {
        label: '독서모임 사서',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'roomList' },
      },
      'talk-search': {
        label: '독서모임 도서검색대',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'bookSearch' },
      },
    },
  },

  // 북 콘서트 (Book Concert)
  bookConcert: {
    floorId: '44444444-4444-4444-4444-444444444444',
    defaultRoomId: 'book-concert-uuid',
    name: '북 콘서트 홀',
    imgAlias: 'bookConcert',
    jsonAlias: 'bookConcertTmj',
    bgm: [
      ...EXTRA_PLAYLIST,
      ...READING_PLAYLIST,
      ...SF_PLAYLIST,
      ...FAIRY_PLAYLIST,
      ...ROMANCE_PLYALIST,
    ],
    zones: {
      'concert-whiteboard': {
        label: '북 콘서트 빔 프로젝트',
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '내 서재로 이동하시겠습니까?',
          targetFloor: 'myRoom',
        },
      },
      'concert-exit': {
        label: '콘서트 퇴장 - 엘레베이터',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'elevator' },
      },
    },
  },

  // 내 서재 (My Room)
  myRoom: {
    floorId: '00000000-0000-0000-0000-000000000000',
    name: '내 서재',
    imgAlias: 'myRoom',
    jsonAlias: 'myRoomTmj',
    bgm: [
      ...EXTRA_PLAYLIST,
      ...READING_PLAYLIST,
      ...SF_PLAYLIST,
      ...FAIRY_PLAYLIST,
      ...ROMANCE_PLYALIST,
    ],
    zones: {
      'myRoom-bookshelf-left': {
        label: '왼쪽 책장',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'bookshelf' },
      },
      'myRoom-bookshelf-right': {
        label: '오른쪽 책장',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'bookshelf' },
      },
      'myRoom-attendance': {
        label: '출석체크 달력',
        trigger: 'interact',
        action: { type: 'openModal', modalType: 'attendance' },
      },
      'myRoom-exit': {
        label: '내 서재 퇴장',
        trigger: 'interact',
        action: {
          type: 'moveConfirm',
          title: '장소 이동',
          message: '도서관 로비로 이동하시겠습니까?',
          targetFloor: 'lobby',
        },
      },
    },
  },
};
