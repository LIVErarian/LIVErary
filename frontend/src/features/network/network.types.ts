// NetworkManager와 GameApp 사이의 소통 방식 및 콜백 함수 모양 정의
import type {
  MoveResponse,
  PlayerLeaveResponse,
  PlayerState,
} from '@/types/socket.types';

// 콜백 함수 타입
export type ConnectCallback = () => void;
export type PlayerJoinCallback = (data: PlayerState) => void;
export type PlayerMoveCallback = (data: MoveResponse) => void;
export type PlayerLeaveCallback = (data: PlayerLeaveResponse) => void;
export type ErrorCallback = (error: string) => void;

export interface SocketConfig {
  url: string;
  reconnectInterval: number;
}
