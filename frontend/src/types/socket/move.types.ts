// ==================== 기본 타입 ======================
export type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

// 사용자 기본 위치
export interface BasePosition {
  floorId: string; // uuid (층마다 지정되어있는 uuid - front에서 지정)
  x: number; // 사용자 위치 (이동량 x)
  y: number; // 사용자 위치
  direction: Direction; // 바라보는 방향
}

// ==================== 위치 소켓 연결 ====================

// [요청] 입장 시 (/app/move/enter)
export type MoveEnterRequest = BasePosition;

// [요청] 이동 중 (/app/move)
export interface MoveRequest extends BasePosition {
  isMoving: boolean;
  isSitting: boolean;
  clientTs: number; // 클라이언트 타임스탬프
}

// [요청] 퇴장 시 (/app/move/exit)
export interface MoveExitRequest {
  floorId: string;
}

// [수신] 서버로부터 받는 이동 데이터 (/topic/floor/{floorId}/move)
// 200ms마다 전체 사용자 위치 전송
export interface MoveBroadcast extends BasePosition {
  userId: string;
  nickname: string;
  isMoving: boolean;
  isSitting: boolean;
  serverTs: number;
}
