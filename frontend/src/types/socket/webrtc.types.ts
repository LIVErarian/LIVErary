// [요청] 방 입장 (/app/joinRoom)
export interface JoinRoomRequest {
  roomId: string;
}

// [요청] 방 퇴장 (/app/leaveRoom)
export interface LeaveRoomRequest {
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

// [수신] 시그널링 메시지 (union type)
export type SignalingMessage =
  | { id: 'existingParticipants'; data: string[] } // 기존 참여자 목록
  | { id: 'newParticipantArrived'; userId: string } // 새 참여자 알림
  | { id: 'participantLeft'; userId: string } // 참여자 퇴장 알림
  | { id: 'receiveDataAnswer'; senderId: string; sdpAnswer: string } // SDP Answer 수신
  | { id: 'iceCandidate'; userId: string; candidate: RTCIceCandidateInit }; // ICE Candidate 수신
