import type { ModalType } from '@/store/useModalStore';

// 층 정의
export type FloorType =
  | 'lobby'
  | 'readingFloor'
  | 'conferenceFloor'
  | 'bookTalkFloor'
  | 'bookConcert'
  | 'myRoom';

// 버튼 설정
export interface MapButtonConfig {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Zone 액션 타입 정의
// 이동 액션
export type MoveConfirmAction = {
  type: 'moveConfirm';
  title?: string;
  message: string;
  targetFloor: FloorType;
};

// 모달 여는 액션
export type OpenModalAction = {
  type: 'openModal';
  modalType: ModalType;
  title?: string;
  message?: string;
};

// 위치 재이동 액션
export type ConfirmRepositionAction = {
  type: 'confirmReposition';
  title?: string;
  message: string;
  confirmPosition:
    | 'zoneCenter'
    | 'screenCenter'
    | 'zoneFrontAbove'
    | 'zoneFrontBelow';
  cancelPosition:
    | 'zoneCenter'
    | 'screenCenter'
    | 'zoneFrontAbove'
    | 'zoneFrontBelow';
};

// 방 나가기 액션
export type LeaveRoomConfirmAction = {
  type: 'leaveRoomConfirm';
  title?: string;
  message: string;
};

// 범용 확인 창
export type ConfirmAction = {
  type: 'confirm';
  title?: string;
  message: string;
};

// 통합 액션 타입
export type MapZoneAction =
  | MoveConfirmAction
  | OpenModalAction
  | ConfirmRepositionAction
  | LeaveRoomConfirmAction
  | ConfirmAction;

// Zone 로직 설정
export interface MapZoneLogic {
  label?: string;
  // 트리거는 단일 문자열일 수도, 배열일 수도 있음
  trigger?:
    | 'enter'
    | 'exit'
    | 'interact'
    | Array<'enter' | 'exit' | 'interact'>;

  action?: MapZoneAction; // interact 트리거용
  enterAction?: MapZoneAction; // enter 트리거용
  exitAction?: MapZoneAction; // exit 트리거용

  // 시각적 아웃라인 패딩
  outlinePadding?: number;
}

// Zone 런타임 설정
// 파싱 함수(mapParser)를 거친 후에는 좌표와 ID가 주입된 이 타입을 사용합니다.
export interface MapZoneRuntime extends MapZoneLogic {
  id: string;
  x: number; // Tiled에서 가져온 실제 픽셀 좌표
  y: number;
  width: number;
  height: number;

  // 아웃라인 렌더링을 위한 별도 좌표 (VISUAL 레이어)
  visual?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

// 충돌 설정
export interface MapCollisionConfig {
  tileWidth: number;
  tileHeight: number;
  width: number;
  height: number;
  grid: number[];
}

// Tiled Map JSON 타입 (Parser 용)
export type TiledLayer = {
  name?: string;
  type?: string;
  data?: number[]; // tilelayer일 경우
  objects?: Array<{
    // objectgroup일 경우
    name: string;
    type?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    visible?: boolean;
    properties?: Array<{ name: string; value: string | number | boolean }>;
  }>;
};

export type TiledMap = {
  width?: number;
  height?: number;
  tilewidth?: number;
  tileheight?: number;
  layers?: TiledLayer[];
};

// 맵 설정 (최종)
export interface MapConfig {
  floorId: string;
  defaultRoomId?: string | null;
  name: string;
  imgAlias: string;
  jsonAlias?: string;
  bgm?: string[];
  categoryImgAliases?: Record<string, string>;

  width?: number;
  height?: number;
  collision?: MapCollisionConfig;
  buttons?: MapButtonConfig[];

  // 객체 형태로 관리
  zones?: Record<string, MapZoneLogic>;
}
