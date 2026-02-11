package com.liverary.backend.chat.dto.response;

import java.util.UUID;
import com.liverary.backend.chat.dto.ChatType;
import lombok.Getter;

/**
 * 서버로부터 수신하는 채팅 데이터 DTO.
 */
@Getter
public class ChatBroadcast {

    // 메시지 고유 ID
    private final String id;

    // 채팅 타입
    private final ChatType type;

    // 메시지 내용
    private final String content;

    // 보낸 사람 ID (말풍선 띄울 대상)
    private final UUID senderId;

    // 채팅창에 표시할 이름
    private final String senderNickname;

    // 귓속말일 경우 받는 사람 ID
    private final UUID targetUserId;

    // 귓속말일 경우 대상 이름
    private final String targetNickname;

    // 서버 시간 (정렬용)
    private final long timestamp;

    // 어느 맵에서 온 건지 (LOCAL일 때)
    private final UUID floorId;

    private ChatBroadcast(String id, ChatType type, String content, UUID senderId, String senderNickname,
                          UUID targetUserId, String targetNickname, long timestamp, UUID floorId) {
        this.id = id;
        this.type = type;
        this.content = content;
        this.senderId = senderId;
        this.senderNickname = senderNickname;
        this.targetUserId = targetUserId;
        this.targetNickname = targetNickname;
        this.timestamp = timestamp;
        this.floorId = floorId;
    }

    public static ChatBroadcast of(String id, ChatType type, String content, UUID senderId, String senderNickname,
                                   UUID targetUserId, String targetNickname, long timestamp, UUID floorId) {
        return new ChatBroadcast(id, type, content, senderId, senderNickname, targetUserId, targetNickname,
                timestamp, floorId);
    }
}
