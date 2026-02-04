package com.liverary.backend.socket.service;

import com.google.gson.JsonObject;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.HistoryStatus;
import com.liverary.backend.room.repository.RoomHistoryRepository;
import com.liverary.backend.room.service.RoomService;
import com.liverary.backend.socket.util.SignalingMessageFactory;
import com.liverary.backend.socket.util.UserSession;
import com.liverary.backend.socket.util.UserSessionRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.KurentoClient;
import org.kurento.client.MediaPipeline;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.io.Closeable;
import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * WebRTC 방 세션 생명주기(입장/퇴장, 시그널링 전달)를 관리한다.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SocketService implements Closeable {

    // 방별 참여자 세션 레지스트리
    private final ConcurrentMap<UUID, ConcurrentMap<UUID, UserSession>> rooms = new ConcurrentHashMap<>();
    // 방별 MediaPipeline 레지스트리
    private final ConcurrentMap<UUID, MediaPipeline> roomPipelines = new ConcurrentHashMap<>();
    // Kurento 클라이언트
    private final KurentoClient kurentoClient;
    // STOMP 메시징 템플릿
    private final SimpMessagingTemplate messagingTemplate;
    // 사용자 세션 레지스트리
    private final UserSessionRegistry registry;
    // 방 퇴장 처리 서비스
    private final RoomService roomService;
    // 방 참여 이력 조회
    private final RoomHistoryRepository roomHistoryRepository;

    /**
     * 방에 입장하고 세션을 생성한 뒤 기존 참여자에게 알린다.
     *
     * @param roomId 방 ID
     * @param userId 사용자 ID
     * @return 생성된 사용자 세션
     */
    public UserSession join(UUID roomId, UUID userId)
            throws IOException {
        // 방당 하나의 MediaPipeline 공유
        MediaPipeline mediaPipeline =
                roomPipelines.computeIfAbsent(roomId, key -> kurentoClient.createMediaPipeline());

        // 방별 참여자 맵 생성/조회
        ConcurrentMap<UUID, UserSession> roomParticipants =
                rooms.computeIfAbsent(roomId, key -> new ConcurrentHashMap<>());

        UserSession participant = null;
        try {
            participant = new UserSession(roomId, userId, mediaPipeline, messagingTemplate);

            // 기존 참여자에게 신규 입장 알림
            broadcastToExistingParticipants(roomParticipants.values(), participant);
            // 참여자 등록
            roomParticipants.put(participant.getUserId(), participant);

            // 신규 참여자에게 기존 참여자 목록 전달
            sendExistingParticipantsTo(roomParticipants.values(), participant);
            return participant;
        } catch (Exception e) {
            if (participant != null) {
                leave(participant);
            }

            if (roomParticipants.isEmpty()) {
                rooms.remove(roomId, roomParticipants);
                MediaPipeline pipeline = roomPipelines.remove(roomId);
                safeReleasePipeline(pipeline, roomId);
            }

            throw e;
        }
    }

    /**
     * 기존 참여자들에게 신규 참여자 입장을 브로드캐스트한다.
     *
     * @param newParticipant 신규 참여자 세션
     */
    private void broadcastToExistingParticipants(Collection<UserSession> roomParticipants,
                                                 UserSession newParticipant) {
        JsonObject msg = SignalingMessageFactory.newParticipantArrived(newParticipant.getUserId());
        for (UserSession participant : roomParticipants) {
            participant.sendMessage(msg);
        }
    }

    /**
     * 신규 참여자에게 기존 참여자 목록을 전달한다.
     *
     * @param receiver 신규 참여자 세션
     */
    public void sendExistingParticipantsTo(Collection<UserSession> roomParticipants,
                                           UserSession receiver) {
        JsonObject message = SignalingMessageFactory.existingParticipants(roomParticipants, receiver);
        receiver.sendMessage(message);
    }

    /**
     * 방을 나가며 사용자 리소스를 해제한다.
     *
     * @param user 퇴장 사용자 세션
     */
    public void leave(UserSession user) {
        if (user == null) {
            return;
        }

        this.removeParticipant(user.getRoomId(), user.getUserId());
        try {
            user.close();
        } catch (IOException e) {
            log.warn("failed to close user session. userId={}, roomId={}", user.getUserId(), user.getRoomId(), e);
        }
    }

    /**
     * 사용자 ID로 세션을 조회/제거한 뒤 퇴장 처리한다.
     *
     * @param userId 사용자 ID
     */
    public void leaveByUserId(UUID userId) {
        UserSession user = registry.removeByUserIdIfPresent(userId);
        if (user == null) {
            return;
        }
        try {
            leave(user);
        } catch (RuntimeException e) {
            log.warn("leave processing failed. userId={}", userId, e);
        }
    }

    /**
     * WebSocket 연결 종료 이벤트를 처리해 퇴장 로직을 수행한다.
     *
     * @param event 세션 종료 이벤트
     */
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        Principal principal = event.getUser();
        if (principal == null) {
            return;
        }

        try {
            UUID userId = UUID.fromString(principal.getName());
            leaveByUserId(userId);
            forceLeaveJoinedRooms(userId);
        } catch (IllegalArgumentException ignored) {
            // Principal name이 UUID 형식이 아니면 소켓 세션 정리 대상이 아니다.
        }
    }

    /**
     * 참여자를 제거하고 남은 참여자에게 알린다.
     */
    private void removeParticipant(UUID roomId, UUID participantName) {
        ConcurrentMap<UUID, UserSession> roomParticipants = rooms.get(roomId);

        // 참여자가 없는 경우
        if (roomParticipants == null) {
            return;
        }

        // 참여자 퇴장
        roomParticipants.remove(participantName);

        // 퇴장 참여자의 미디어 연결 해제
        disconnectMediaFromAll(roomParticipants.values(), participantName);

        // 퇴장 알림 전송
        JsonObject leftMsg = SignalingMessageFactory.participantLeft(participantName);
        List<UUID> failed = broadcastSafely(roomParticipants.values(), leftMsg);
        failed.forEach(this::leaveByUserId);

        if (roomParticipants.isEmpty()) {
            rooms.remove(roomId, roomParticipants);
            MediaPipeline pipeline = roomPipelines.remove(roomId);
            safeReleasePipeline(pipeline, roomId);
        }

    }

    /**
     * 메시지 전송 실패한 참여자 ID 목록을 반환한다.
     */
    private List<UUID> broadcastSafely(Collection<UserSession> roomParticipants, JsonObject message) {
        List<UUID> failed = new ArrayList<>();

        for (UserSession participant : roomParticipants) {
            try {
                participant.sendMessage(message);
            } catch (RuntimeException e) {
                failed.add(participant.getUserId());
                log.debug("broadcast failed. userId={}", participant.getUserId(), e);
            }
        }

        return failed;
    }

    /**
     * 모든 피어에서 퇴장 참여자의 미디어를 끊는다.
     */
    private void disconnectMediaFromAll(Collection<UserSession> roomParticipants,
                                        UUID departedParticipantName) {
        for (UserSession participant : roomParticipants) {
            participant.cancelDataFrom(departedParticipantName);
        }
    }

    /**
     * 모든 세션을 닫고 미디어 파이프라인을 해제한다.
     */
    @Override
    public void close() {
        for (final ConcurrentMap<UUID, UserSession> roomParticipants : rooms.values()) {
            for (final UserSession user : roomParticipants.values()) {
                try {
                    user.close();
                } catch (IOException e) {
                    throw new BaseException(ErrorCode.INTERNAL_SERVER_ERROR);
                }
            }
        }

        rooms.clear();
        for (final MediaPipeline pipeline : roomPipelines.values()) {
            safeReleasePipeline(pipeline, null);
        }
        roomPipelines.clear();
    }

    private void safeReleasePipeline(MediaPipeline pipeline, UUID roomId) {
        if (pipeline == null) {
            return;
        }

        try {
            pipeline.release();
        } catch (RuntimeException e) {
            log.warn("pipeline release failed. roomId={}", roomId, e);
        }
    }

    private void forceLeaveJoinedRooms(UUID userId) {
        List<UUID> joinedRoomIds = roomHistoryRepository.findRoomIdsByUserIdAndStatus(userId, HistoryStatus.JOINED)
                .stream()
                .distinct()
                .toList();

        for (UUID roomId : joinedRoomIds) {
            try {
                roomService.leaveRoom(roomId, userId);
            } catch (BaseException e) {
                if (e.getErrorCode() != ErrorCode.ROOM_HISTORY_NOT_FOUND) {
                    log.warn("force room leave failed. userId={}, roomId={}", userId, roomId, e);
                }
            } catch (RuntimeException e) {
                log.warn("force room leave failed. userId={}, roomId={}", userId, roomId, e);
            }
        }
    }
}
