package com.liverary.backend.socket.util;

import java.io.Closeable;
import java.io.IOException;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
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
    private final AtomicBoolean closed = new AtomicBoolean(false);

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
     * 사용자 송신용 WebRTC 엔드포인트를 반환한다.
     *
     * @return 송신 엔드포인트
     */
    public WebRtcEndpoint getOutgoingWebRtcPeer() {
        return outgoingMedia;
    }

    /**
     * 다른 사용자로부터 데이터를 수신하도록 WebRTC 연결을 설정한다.
     *
     * @param sender   데이터 송신 사용자
     * @param sdpOffer 수신자에게 전달된 SDP Offer
     */
    public void receiveDataFrom(UserSession sender, String sdpOffer) {

        // 송신자별 수신 엔드포인트를 가져와 SDP 응답 생성
        final WebRtcEndpoint endpoint = this.getEndpointForUser(sender);
        final String ipSdpAnswer = endpoint.processOffer(sdpOffer);

        JsonObject message = SignalingMessageFactory.receiveDataAnswer(
                sender.getUserId(),
                ipSdpAnswer
        );

        this.sendMessage(message);
        endpoint.gatherCandidates();
    }

    /**
     * 송신자별 수신 WebRTC 엔드포인트를 생성/조회한다.
     *
     * @param sender 데이터 송신 사용자
     * @return 수신 엔드포인트
     */
    private WebRtcEndpoint getEndpointForUser(final UserSession sender) {
        if (sender.getUserId().equals(userId)) {
            return outgoingMedia;
        }

        WebRtcEndpoint incoming = incomingMedia.computeIfAbsent(sender.getUserId(), key -> {
            WebRtcEndpoint endpoint = new WebRtcEndpoint.Builder(pipeline).build();
            endpoint.addIceCandidateFoundListener(new EventListener<IceCandidateFoundEvent>() {
                @Override
                public void onEvent(IceCandidateFoundEvent event) {
                    JsonObject msg = SignalingMessageFactory.iceCandidate(sender.getUserId(), event.getCandidate());
                    sendToUser(msg);
                }
            });
            return endpoint;
        });

        try {
            // 송신자와 수신 엔드포인트를 연결
            sender.getOutgoingWebRtcPeer().connect(incoming);
            // 지연된 ICE 후보를 모두 반영
            drainQueuedCandidates(sender.getUserId(), incoming);
            return incoming;
        } catch (RuntimeException e) {
            // connect/process 중간 실패 시 부분 생성된 수신 endpoint를 즉시 정리한다.
            cancelDataFrom(sender.getUserId());
            throw e;
        }
    }

    /**
     * 특정 사용자 ID로부터의 데이터 수신을 중단한다.
     *
     * @param senderName 송신자 사용자 ID
     */
    public void cancelDataFrom(final UUID senderName) {
        final WebRtcEndpoint incoming = incomingMedia.remove(senderName);
        queuedCandidates.remove(senderName);

        if (incoming == null) {
            return;
        }

        safeRelease(incoming);
    }

    /**
     * 세션에서 생성한 모든 WebRTC 리소스를 해제한다.
     *
     * @throws IOException 리소스 해제 실패 시
     */
    @Override
    public void close() throws IOException {
        // 여러 경로(leave/disconnect/shutdown)에서 중복 호출돼도 한 번만 정리한다.
        if (!closed.compareAndSet(false, true)) {
            return;
        }

        incomingMedia.values().forEach(this::safeRelease);
        incomingMedia.clear();
        queuedCandidates.clear();
        safeRelease(outgoingMedia);
    }

    /**
     * 사용자에게 신호 메시지를 전송한다.
     *
     * @param message 전송할 메시지
     */
    public void sendMessage(JsonObject message) {
        sendToUser(message);
    }

    /**
     * 사용자 개인 큐로 메시지를 전달한다.
     *
     * @param message 전송할 메시지
     */
    private void sendToUser(JsonObject message) {
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), USER_DESTINATION, message.toString());
        } catch (RuntimeException e) {
            log.debug("signaling send failed. userId={}", userId, e);
        }
    }

    /**
     * ICE 후보를 해당 엔드포인트에 추가하거나 큐에 적재한다.
     *
     * @param candidate ICE 후보
     * @param userId    후보가 속한 사용자 ID
     */
    public void addCandidate(IceCandidate candidate, UUID userId) {
        if (this.userId.equals(userId)) {
            outgoingMedia.addIceCandidate(candidate);
        } else {
            WebRtcEndpoint webRtc = incomingMedia.get(userId);
            if (webRtc != null) {
                webRtc.addIceCandidate(candidate);
                return;
            }
            queuedCandidates
                    .computeIfAbsent(userId, key -> new ConcurrentLinkedQueue<>())
                    .add(candidate);
        }
    }

    /**
     * 지연된 ICE 후보 큐를 비우고 엔드포인트에 반영한다.
     *
     * @param senderId 송신자 사용자 ID
     * @param endpoint 수신 엔드포인트
     */
    private void drainQueuedCandidates(UUID senderId, WebRtcEndpoint endpoint) {
        Queue<IceCandidate> queue = queuedCandidates.remove(senderId);
        if (queue == null) {
            return;
        }
        IceCandidate candidate;
        while ((candidate = queue.poll()) != null) {
            endpoint.addIceCandidate(candidate);
        }
    }

    private void safeRelease(WebRtcEndpoint endpoint) {
        try {
            endpoint.release();
        } catch (RuntimeException e) {
            // release 실패는 다음 정리 흐름을 막지 않도록 로그만 남긴다.
            log.debug("endpoint release failed. userId={}, roomId={}", userId, roomId, e);
        }
    }
}
