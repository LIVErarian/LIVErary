export type FloorType =
  | 'lobby'
  | 'readingFloor'
  | 'conferenceFloor'
  | 'bookTalkFloor'
  | 'bookConcert'
  | 'myRoom';

export interface MapButtonConfig {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MapZoneAction =
  | {
      type: 'moveConfirm';
      title?: string;
      message: string;
      targetFloor: FloorType;
    }
  | {
      type: 'confirm';
      title?: string;
      message: string;
    }
  | {
      type: 'openModal';
      modalType: 'elevator' | 'boardList' | 'bookshelf' | 'bookSearch';
      title?: string;
      message?: string;
    }
  | {
      type: 'reposition';
      title?: string;
      message: string;
      position: 'center';
    }
  | {
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

export interface MapZoneConfig {
  absH?: number;
  absW?: number;
  absY?: number;
  absX?: number;
  id: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  trigger?:
    | 'enter'
    | 'exit'
    | 'interact'
    | Array<'enter' | 'exit' | 'interact'>;
  action?: MapZoneAction;
  enterAction?: MapZoneAction;
  exitAction?: MapZoneAction;
}

export interface MapCollisionConfig {
  tileWidth: number;
  tileHeight: number;
  width: number;
  height: number;
  grid: number[];
}

export interface MapConfig {
  floorId: string;
  defaultRoomId?: string | null; // myRoom에서는 필요 없음
  name: string;
  img: string;
  categoryImgs?: Record<string, string>; // booktalk에서 일부 카테고리에만 지정
  width?: number;
  height?: number;
  collision?: MapCollisionConfig;
  buttons?: MapButtonConfig[];
  zones?: MapZoneConfig[];
}
