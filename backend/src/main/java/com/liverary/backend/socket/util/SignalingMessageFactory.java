package com.liverary.backend.socket.util;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.kurento.client.IceCandidate;
import org.kurento.jsonrpc.JsonUtils;

import java.util.Collection;
import java.util.UUID;

/**
 * WebRTC 시그널링에 필요한 메시지 포맷을 생성한다.
 */
public class SignalingMessageFactory {

    /**
     * 기존 참가자 목록을 전달하는 메시지를 만든다.
     *
     * @param participants 방에 있는 참가자 목록
     * @param receiver     메시지를 받을 사용자
     * @return 시그널링 메시지 JSON
     */
    public static JsonObject existingParticipants(Collection<UserSession> participants,
                                                  UserSession receiver) {
        // 수신자를 제외한 사용자 ID 목록 생성
        JsonArray userIds = participants.stream()
                .filter(p -> !p.equals(receiver))
                .map(UserSession::getUserId)
                .map(UUID::toString)
                .collect(JsonArray::new, JsonArray::add, JsonArray::addAll);

        // existingParticipants 메시지 구성
        JsonObject msg = new JsonObject();
        msg.addProperty("id", "existingParticipants");
        msg.add("data", userIds);
        return msg;
    }

    /**
     * 새 참가자 입장을 알리는 메시지를 만든다.
     *
     * @param participantId 참가자 ID
     * @return 시그널링 메시지 JSON
     */
    public static JsonObject newParticipantArrived(UUID participantId) {
        // newParticipantArrived 메시지 구성
        JsonObject msg = new JsonObject();
        msg.addProperty("id", "newParticipantArrived");
        msg.addProperty("userId", participantId.toString());
        return msg;
    }

    /**
     * 참가자 퇴장을 알리는 메시지를 만든다.
     *
     * @param participantId 참가자 ID
     * @return 시그널링 메시지 JSON
     */
    public static JsonObject participantLeft(UUID participantId) {
        // participantLeft 메시지 구성
        JsonObject msg = new JsonObject();
        msg.addProperty("id", "participantLeft");
        msg.addProperty("userId", participantId.toString());
        return msg;
    }

    /**
     * ICE 후보 전달 메시지를 만든다.
     *
     * @param userId    사용자 ID
     * @param candidate ICE 후보
     * @return 시그널링 메시지 JSON
     */
    public static JsonObject iceCandidate(UUID userId, IceCandidate candidate) {
        // iceCandidate 메시지 구성
        JsonObject msg = new JsonObject();
        msg.addProperty("id", "iceCandidate");
        msg.addProperty("userId", userId.toString());
        msg.add("candidate", JsonUtils.toJsonObject(candidate));
        return msg;
    }

    /**
     * SDP Offer에 대한 Answer를 전달하는 메시지를 만든다.
     *
     * @param senderId  송신자 ID
     * @param sdpAnswer 생성된 SDP Answer
     * @return 시그널링 메시지 JSON
     */
    public static JsonObject receiveDataAnswer(UUID senderId, String sdpAnswer) {
        JsonObject msg = new JsonObject();
        msg.addProperty("id", "receiveDataAnswer");
        msg.addProperty("senderId", senderId.toString());
        msg.addProperty("sdpAnswer", sdpAnswer);
        return msg;
    }
}
