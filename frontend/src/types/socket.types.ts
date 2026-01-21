import type { Direction } from '@/features/player/Player';

interface BaseMovementData {
  x: number; // 이동한 x 좌표
  y: number; // 이동한 y 좌표
  direction: Direction; // 이동 방향
  isMoving: boolean; // 움직이는 중인지 확인
}

interface Identifiable {
  id: string;
}

// 서버 -> 클라이언트: 다른 사람의 전체 정보
export interface PlayerState extends BaseMovementData, Identifiable {
  nickname: string; // 사용자 이름
}

// 클라이언트 -> 서버: 나의 이동 정보
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MoveRequest extends BaseMovementData {}

// 서버 -> 클라이언트: 남의 이동 정보
export interface MoveResponse extends BaseMovementData, Identifiable {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlayerLeaveResponse extends Identifiable {}
