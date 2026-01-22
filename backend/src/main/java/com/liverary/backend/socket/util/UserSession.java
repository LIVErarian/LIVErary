package com.liverary.backend.socket.util;

import java.io.Closeable;
import java.io.IOException;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ConcurrentMap;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.EventListener;
import org.kurento.client.IceCandidate;
import org.kurento.client.IceCandidateFoundEvent;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.google.gson.JsonObject;

/**
 * Kurento 기반 WebRTC 통화를 위한 사용자 세션을 관리한다.
 */
@Getter
@Slf4j
public class UserSession implements Closeable {

    // 사용자에게 신호 메시지를 전달할 대상 경로
    private static final String USER_DESTINATION = "/queue/signaling";

    // STOMP 메시징 템플릿
    private final SimpMessagingTemplate messagingTemplate;

    // Kurento 미디어 파이프라인
    private final MediaPipeline pipeline;

    // 사용자/방 식별자 및 송수신 엔드포인트
    private final UUID userId;
    private final UUID roomId;
    private final WebRtcEndpoint outgoingMedia;
    private final ConcurrentMap<UUID, WebRtcEndpoint> incomingMedia = new ConcurrentHashMap<>();
    private final ConcurrentMap<UUID, Queue<IceCandidate>> queuedCandidates = new ConcurrentHashMap<>();

    /**
     * 사용자 세션을 생성하고 송신용 WebRTC 엔드포인트를 구성한다.
     *
     * @param roomId             방 ID
     * @param userId             사용자 ID
     * @param pipeline           Kurento 미디어 파이프라인
     * @param messagingTemplate  STOMP 메시징 템플릿
     */
    public UserSession(UUID roomId, final UUID userId,
                       MediaPipeline pipeline, SimpMessagingTemplate messagingTemplate) {

        this.pipeline = pipeline;
        this.userId = userId;
        this.messagingTemplate = messagingTemplate;
        this.roomId = roomId;
        this.outgoingMedia = new WebRtcEndpoint.Builder(pipeline).build();

        // 송신 엔드포인트에서 ICE 후보 생성 시 사용자에게 전달
        this.outgoingMedia.addIceCandidateFoundListener(new EventListener<IceCandidateFoundEvent>() {

            @Override
            public void onEvent(IceCandidateFoundEvent event) {
                JsonObject msg = SignalingMessageFactory.iceCandidate(userId, event.getCandidate());
                sendToUser(msg);
            }
        });
    }


    /**
     * 세션에서 생성한 모든 WebRTC 리소스를 해제한다.
     *
     * @throws IOException 리소스 해제 실패 시
     */
    @Override
    public void close() throws IOException {
        log.debug("PARTICIPANT {}: Releasing resources", this.userId);
        for (final UUID remoteParticipantId : incomingMedia.keySet()) {

            log.trace("PARTICIPANT {}: Released incoming EP for {}", this.userId, remoteParticipantId);

            final WebRtcEndpoint ep = this.incomingMedia.get(remoteParticipantId);

            ep.release();
        }

        outgoingMedia.release();
    }

    /**
     * 사용자에게 신호 메시지를 전송한다.
     *
     * @param message 전송할 메시지
     * @throws IOException 메시지 전송 실패 시
     */
    public void sendMessage(JsonObject message) throws IOException {
        log.debug("USER {}: Sending message {}", userId, message);
        sendToUser(message);
    }

    /**
     * 사용자 개인 큐로 메시지를 전달한다.
     *
     * @param message 전송할 메시지
     */
    private void sendToUser(JsonObject message) {
        messagingTemplate.convertAndSendToUser(userId.toString(), USER_DESTINATION, message.toString());
    }


}
