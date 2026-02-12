// ==================== 기본 타입 ======================
export type ChatType = 'LOCAL' | 'GLOBAL' | 'WHISPER' | 'SYSTEM';

// 기본 채팅 데이터 구조
export interface BaseChat {
  type: ChatType;
  content: string;
}

// ==================== 채팅 소켓 연결 ====================

// [요청] 입장 시 (/app/chat/enter)
export interface ChatEnterRequest {
  floorId: string; // 입장한 맵 ID (필수)
  nickname: string; // 입장한 사람 닉네임 (서버가 알지만 명시적으로 보냄)
}

// [요청] 채팅 전송 시 (/app/chat/message)
export interface ChatRequest extends BaseChat {
  floorId?: string; // LOCAL 채팅일 때 필수
  targetUserId?: string; // 귓속말일 때 필수, ID
  targetNickname?: string; // 표시용 닉네임
}

// [요청] 퇴장 시 (/app/chat/exit)
export interface ChatExitRequest {
  floorId: string;
}

// [수신] 서버로부터 받는 채팅 데이터
// Local: /topic/floor/{floorId}/chat
// Global: /topic/global/chat
// Whisper: /user/queue/chat
export interface ChatBroadcast extends BaseChat {
  id: string; // 메시지 고유 ID (UUID)
  senderId: string; // 보낸 사람 ID (말풍선 띄울 대상)
  senderNickname: string; // 채팅창에 표시할 이름
  targetUserId?: string; // 귓속말일 경우 받는 사람 ID
  targetNickname?: string; // 귓속말일 경우 대상 이름
  timestamp: number; // 서버 시간 (정렬용)
  floorId?: string; // 어느 맵에서 온 건지 (LOCAL일 때)
}
