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
     * 사용자 송신용 WebRTC 엔드포인트를 반환한다.
     *
     * @return 송신 엔드포인트
     */
    public WebRtcEndpoint getOutgoingWebRtcPeer() {
        return outgoingMedia;
    }

    /**
     * 다른 사용자로부터 영상을 수신하도록 WebRTC 연결을 설정한다.
     *
     * @param sender   영상 송신 사용자
     * @param sdpOffer 수신자에게 전달된 SDP Offer
     * @throws IOException 메시지 전송 실패 시
     */
    public void receiveVideoFrom(UserSession sender, String sdpOffer) throws IOException {
        log.info("USER {}: connecting with {} in room {}", this.userId, sender.getUserId(), this.roomId);

        log.trace("USER {}: SdpOffer for {} is {}", this.userId, sender.getUserId(), sdpOffer);

        // 송신자별 수신 엔드포인트를 가져와 SDP 응답 생성
        final String ipSdpAnswer = this.getEndpointForUser(sender).processOffer(sdpOffer);
        final JsonObject scParams = new JsonObject();
        scParams.addProperty("id", "receiveVideoAnswer");
        scParams.addProperty("senderId", sender.getUserId().toString());
        scParams.addProperty("sdpAnswer", ipSdpAnswer);

        log.trace("USER {}: SdpAnswer for {} is {}", this.userId, sender.getUserId(), ipSdpAnswer);
        this.sendMessage(scParams);
        log.debug("gather candidates");
        this.getEndpointForUser(sender).gatherCandidates();
    }

    /**
     * 송신자별 수신 WebRTC 엔드포인트를 생성/조회한다.
     *
     * @param sender 영상 송신 사용자
     * @return 수신 엔드포인트
     */
    private WebRtcEndpoint getEndpointForUser(final UserSession sender) {
        if (sender.getUserId().equals(userId)) {
            log.debug("PARTICIPANT {}: configuring loopback", this.userId);
            return outgoingMedia;
        }

        log.debug("PARTICIPANT {}: receiving video from {}", this.userId, sender.getUserId());

        WebRtcEndpoint incoming = incomingMedia.get(sender.getUserId());
        if (incoming == null) {
            log.debug("PARTICIPANT {}: creating new endpoint for {}", this.userId, sender.getUserId());
            incoming = new WebRtcEndpoint.Builder(pipeline).build();

            // 수신 엔드포인트의 ICE 후보를 상대에게 전달
            incoming.addIceCandidateFoundListener(new EventListener<IceCandidateFoundEvent>() {

                @Override
                public void onEvent(IceCandidateFoundEvent event) {
                    JsonObject msg =
                            SignalingMessageFactory.iceCandidate(sender.getUserId(), event.getCandidate());
                    sendToUser(msg);
                }
            });

            incomingMedia.put(sender.getUserId(), incoming);
        }

        log.debug("PARTICIPANT {}: obtained endpoint for {}", this.userId, sender.getUserId());
        // 송신자와 수신 엔드포인트를 연결
        sender.getOutgoingWebRtcPeer().connect(incoming);
        // 지연된 ICE 후보를 모두 반영
        drainQueuedCandidates(sender.getUserId(), incoming);

        return incoming;
    }

    /**
     * 특정 사용자 ID로부터의 영상 수신을 중단한다.
     *
     * @param senderName 송신자 사용자 ID
     */
    public void cancelVideoFrom(final UUID senderName) {
        log.debug("PARTICIPANT {}: canceling video reception from {}", this.userId, senderName);
        final WebRtcEndpoint incoming = incomingMedia.remove(senderName);
        queuedCandidates.remove(senderName);

        if (incoming == null) {
            return;
        }

        log.debug("PARTICIPANT {}: removing endpoint for {}", this.userId, senderName);
        incoming.release();
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
}
