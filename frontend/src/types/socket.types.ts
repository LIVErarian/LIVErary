// 서버에서 보내주는 JSON 데이터 모양 정의

import type { Direction } from '@/features/player/Player';

export interface PlayerState {
  id: string; // PK
  nickname: string; // 사용자 이름
  x: number; // 사용자 x 좌표
  y: number; // 사용자 y 좌표
  direction: Direction; // 보고있는 방향
  isMoving: boolean; // 움직이는 중인지 확인
}

export interface MovePayload {
  x: number; // 이동한 x 좌표
  y: number; // 이동한 y 좌표
  direction: Direction; // 이동 방향
  isMoving: boolean; // 움직이는 중인지 확인
}
