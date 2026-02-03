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
      modalType: 'elevator';
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

export interface MapConfig {
  floorId: string;
  name: string;
  img: string;
  width?: number;
  height?: number;
  buttons?: MapButtonConfig[];
  zones?: MapZoneConfig[];
}
