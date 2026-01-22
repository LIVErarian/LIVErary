package com.liverary.backend.socket.controller;

import java.io.IOException;
import java.security.Principal;
import java.util.UUID;

import com.liverary.backend.room.service.RoomService;
import com.liverary.backend.socket.dto.request.ConnectRoomRequest;
import com.liverary.backend.socket.dto.request.IceCandidateRequest;
import com.liverary.backend.socket.dto.request.ReceiveVideoRequest;
import com.liverary.backend.socket.service.SocketService;
import com.liverary.backend.socket.util.UserSession;
import com.liverary.backend.socket.util.UserSessionRegistry;
import lombok.RequiredArgsConstructor;
import org.kurento.client.IceCandidate;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

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
    // STOMP 메시징 템플릿
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;

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
        UUID userId = UUID.fromString(principal.getName());

        // 방 입장 처리 후 세션 등록
        UserSession user = socketService.join(roomId, userId, messagingTemplate);
        registry.register(user);
    }

    /**
     * SDP Offer를 받아 수신자/발신자 간 연결을 설정한다.
     *
     * @param message   SDP Offer 요청 DTO
     * @param principal 현재 사용자 Principal
     * @throws IOException 메시지 전송 실패 시
     */
    @MessageMapping("/receiveVideoFrom")
    public void receiveVideoFrom(ReceiveVideoRequest message, Principal principal)
            throws IOException {
        // 본인 세션 조회
        final UserSession user = registry.getByUserId(UUID.fromString(principal.getName()));
        if (user == null) {
            return;
        }
        // 발신자 세션 조회
        final UUID senderId = message.getSenderId();
        if (senderId == null) {
            return;
        }
        final UserSession sender = registry.getByUserId(senderId);
        if (sender == null) {
            return;
        }
        // 동일 방 여부 검증
        if (!user.getRoomId().equals(sender.getRoomId())) {
            return;
        }
        // SDP Offer 전달
        final String sdpOffer = message.getSdpOffer();
        user.receiveVideoFrom(sender, sdpOffer);
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
        UserSession user = registry.getByUserId(UUID.fromString(principal.getName()));
        if (user == null) {
            return;
        }
        // 후보 소유자 조회
        if (message.getUserId() == null || message.getCandidate() == null) {
            return;
        }
        UserSession candidateOwner = registry.getByUserId(message.getUserId());
        if (candidateOwner == null) {
            return;
        }
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
     * WebSocket 연결 종료 이벤트를 처리해 퇴장 로직을 수행한다.
     *
     * @param event 세션 종료 이벤트
     * @throws IOException 메시지 전송 실패 시
     */
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) throws IOException {
        Principal principal = event.getUser(); // determineUser에서 설정된 Principal
        if (principal == null) return;

        UUID userId = UUID.fromString(principal.getName()); // name에 userId를 넣었으니
        UserSession user = registry.removeByUserId(userId);
        if (user != null) {
            leaveRoomInternal(user);
        }
    }


    /**
     * 공통 퇴장 처리 로직.
     *
     * @param user 퇴장 대상 사용자 세션
     * @throws IOException 메시지 전송 실패 시
     */
    private void leaveRoomInternal(UserSession user) throws IOException {
        socketService.leave(user);
    }


}
