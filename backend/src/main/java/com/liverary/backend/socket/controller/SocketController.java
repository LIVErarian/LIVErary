package com.liverary.backend.socket.controller;

import java.io.IOException;
import java.security.Principal;
import java.util.UUID;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.service.RoomService;
import com.liverary.backend.socket.dto.request.ConnectRoomRequest;
import com.liverary.backend.socket.dto.request.IceCandidateRequest;
import com.liverary.backend.socket.dto.request.ReceiveDataRequest;
import com.liverary.backend.socket.service.SocketService;
import com.liverary.backend.socket.util.UserSession;
import com.liverary.backend.socket.util.UserSessionRegistry;
import lombok.RequiredArgsConstructor;
import org.kurento.client.IceCandidate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

/**
 * STOMP 메시지를 통해 WebRTC 방 참가 요청을 처리한다.
 */
@Controller
@RequiredArgsConstructor
public class SocketController {

    // WebRTC 세션 관리 서비스
    private final SocketService socketService;
    // 사용자 세션 레지스트리
    private final UserSessionRegistry registry;

    private final RoomService roomService;

    private UUID getUserId(Principal principal) {
        if (principal == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            throw new BaseException(ErrorCode.INVALID_UUID_FORMAT);
        }
    }

    /**
     * 방 참여 요청을 처리하고 참가자 세션을 등록한다.
     *
     * @param request   방 참여 요청 DTO
     * @param principal 인증된 사용자 Principal
     * @throws IOException 메시지 전송 실패 시
     */
    @MessageMapping("/joinRoom")
    public void joinRoom(ConnectRoomRequest request, Principal principal)
            throws IOException {
        // 요청에서 방 ID, Principal에서 사용자 ID 추출
        UUID roomId = request.getRoomId();
        UUID userId = getUserId(principal);

        // HTTP 입장 기록이 있는지 확인
        roomService.validateJoin(roomId, userId);

        // 방 입장 처리 후 세션 등록
        UserSession userSession = socketService.join(roomId, userId);
        registry.register(userSession);
    }

    /**
     * SDP Offer를 받아 수신자/발신자 간 연결을 설정한다.
     *
     * @param message   SDP Offer 요청 DTO
     * @param principal 현재 사용자 Principal
     * @throws IOException 메시지 전송 실패 시
     */
    @MessageMapping("/receiveDataFrom")
    public void receiveDataFrom(ReceiveDataRequest message, Principal principal) {
        // 본인 세션 조회
        UserSession user = registry.getByUserId(getUserId(principal));

        // 발신자 세션 조회
        UUID senderId = message.getSenderId();

        UserSession sender = registry.getByUserId(senderId);

        // 동일 방 여부 검증
        if (!user.getRoomId().equals(sender.getRoomId())) {
            throw new BaseException(ErrorCode.SOCKET_ROOM_MISMATCH);
        }

        // SDP Offer 전달
        String sdpOffer = message.getSdpOffer();
        user.receiveDataFrom(sender, sdpOffer);
    }

    /**
     * ICE Candidate를 수신하여 상대 피어에게 전달한다.
     *
     * @param message ICE Candidate 요청 DTO
     * @param principal 현재 사용자 Principal
     */
    @MessageMapping("/onIceCandidate")
    public void onIceCandidate(IceCandidateRequest message, Principal principal) {
        // 본인 세션 조회
        UserSession user = registry.getByUserId(getUserId(principal));

        // 후보 소유자 조회
        UserSession candidateOwner = registry.getByUserId(message.getUserId());

        // 동일 방 여부 검증
        if (!user.getRoomId().equals(candidateOwner.getRoomId())) {
            return;
        }

        // ICE Candidate 전달
        IceCandidateRequest.IceCandidateInfo candidate = message.getCandidate();
        IceCandidate cand = new IceCandidate(candidate.getCandidate(), candidate.getSdpMid(),
                candidate.getSdpMLineIndex());
        user.addCandidate(cand, message.getUserId());
    }

    /**
     * STOMP leaveRoom 요청을 처리해 사용자를 방에서 제거하고 리소스를 정리한다.
     *
     * @param principal 현재 사용자 Principal
     */
    @MessageMapping("/leaveRoom")
    public void leaveRoom(Principal principal) {
        UUID userId = getUserId(principal);
        socketService.leaveByUserId(userId);
    }
}
