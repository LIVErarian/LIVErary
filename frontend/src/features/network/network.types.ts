// NetworkManager와 GameApp 사이의 소통 방식 및 콜백 함수 모양 정의
import type { MovePayload } from '@/types/socket.types';

// 콜백 함수 타입
export type ConnectCallback = () => void;
export type MoveCallback = (data: MovePayload) => void;
export type ErrorCallback = (error: string) => void;

export interface SocketConfig {
  url: string;
  reconnectInterval: number;
}
