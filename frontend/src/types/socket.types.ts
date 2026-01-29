export type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

// 사용자 기본 위치
export interface BasePosition {
  floorId: string; // uuid (층마다 지정되어있는 uuid - front에서 지정)
  x: number; // 사용자 위치 (이동량 x)
  y: number; // 사용자 위치
  direction: Direction; // 바라보는 방향
}

// ==================== 위치 동기화 ======================
// [요청] 입장 시 (/app/move/enter)
export type MoveEnterRequest = BasePosition;

// [요청] 이동 중 (/app/move)
export interface MoveRequest extends BasePosition {
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
  serverTs: number;
}

// =================== WebRTC 관련 =======================

// [요청] 방 입장 (/app/joinRoom)
export interface JoinRoomRequest {
  roomId: string;
}

// [요청] SDP Offer 전달 (/app/receiveDataFrom)
export interface ReceiveDataFromRequest {
  senderId: string;
  sdpOffer: string;
}

// [요청] ICE Candidate 전달 (/app/onIceCandidate)
export interface IceCandidateRequest {
  userId: string;
  candidate: RTCIceCandidateInit; // WebRTC 표준 타입 사용
}

// [수신] 시그널링 메시지
export type SignalingMessage =
  | { id: 'existingParticipants'; data: string[] } // 기존 참여자 목록
  | { id: 'newParticipantArrived'; userId: string } // 새 참여자 알림
  | { id: 'participantLeft'; userId: string } // 참여자 퇴장 알림
  | { id: 'receiveDataAnswer'; senderId: string; sdpAnswer: string } // SDP Answer 수신
  | { id: 'iceCandidate'; userId: string; candidate: RTCIceCandidateInit }; // ICE Candidate 수신
