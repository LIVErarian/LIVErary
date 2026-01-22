package com.liverary.backend.socket.service;

import com.google.gson.JsonObject;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.socket.util.SignalingMessageFactory;
import com.liverary.backend.socket.util.UserSession;
import lombok.RequiredArgsConstructor;
import org.kurento.client.KurentoClient;
import org.kurento.client.MediaPipeline;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.Closeable;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * WebRTC 방 세션 생명주기(입장/퇴장, 시그널링 전달)를 관리한다.
 */
@Service
@RequiredArgsConstructor
public class SocketService implements Closeable {

    // 방별 참여자 세션 레지스트리
    private final ConcurrentMap<UUID, ConcurrentMap<UUID, UserSession>> rooms = new ConcurrentHashMap<>();
    // 방별 MediaPipeline 레지스트리
    private final ConcurrentMap<UUID, MediaPipeline> roomPipelines = new ConcurrentHashMap<>();
    // Kurento 클라이언트
    private final KurentoClient kurentoClient;

    /**
     * 방에 입장하고 세션을 생성한 뒤 기존 참여자에게 알린다.
     *
     * @param roomId 방 ID
     * @param userId 사용자 ID
     * @param messagingTemplate STOMP 메시징 템플릿
     * @return 생성된 사용자 세션
     * @throws IOException 메시지 전송 실패 시
     */
    public UserSession join(UUID roomId, UUID userId, SimpMessagingTemplate messagingTemplate)
            throws IOException {
        // 방당 하나의 MediaPipeline 공유
        MediaPipeline mediaPipeline =
                roomPipelines.computeIfAbsent(roomId, key -> kurentoClient.createMediaPipeline());
        UserSession participant = new UserSession(roomId, userId, mediaPipeline, messagingTemplate);

        // 방별 참여자 맵 생성/조회
        ConcurrentMap<UUID, UserSession> roomParticipants =
                rooms.computeIfAbsent(roomId, key -> new ConcurrentHashMap<>());

        // 기존 참여자에게 신규 입장 알림
        broadcastToExistingParticipants(roomParticipants.values(), participant);
        // 참여자 등록
        roomParticipants.put(participant.getUserId(), participant);

        // 신규 참여자에게 기존 참여자 목록 전달
        sendExistingParticipantsTo(roomParticipants.values(), participant);
        return participant;
    }

    /**
     * 기존 참여자들에게 신규 참여자 입장을 브로드캐스트한다.
     *
     * @param newParticipant 신규 참여자 세션
     * @throws IOException 메시지 전송 실패 시
     */
    private void broadcastToExistingParticipants(Collection<UserSession> roomParticipants,
                                                 UserSession newParticipant) throws IOException {
        JsonObject msg = SignalingMessageFactory.newParticipantArrived(newParticipant.getUserId());
        for (UserSession participant : roomParticipants) {
            participant.sendMessage(msg);
        }
    }

    /**
     * 신규 참여자에게 기존 참여자 목록을 전달한다.
     *
     * @param receiver 신규 참여자 세션
     * @throws IOException 메시지 전송 실패 시
     */
    public void sendExistingParticipantsTo(Collection<UserSession> roomParticipants,
                                           UserSession receiver) throws IOException {
        JsonObject message = SignalingMessageFactory.existingParticipants(roomParticipants, receiver);
        receiver.sendMessage(message);
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
            pipeline.release();
        }
        roomPipelines.clear();
    }
}