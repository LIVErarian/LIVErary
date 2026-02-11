package com.liverary.backend.chat.service;

import java.security.Principal;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import com.liverary.backend.chat.dto.ChatType;
import com.liverary.backend.chat.dto.request.ChatEnterRequest;
import com.liverary.backend.chat.dto.request.ChatRequest;
import com.liverary.backend.chat.dto.response.ChatBroadcast;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * 채팅 메시지 라우팅 및 사용자 상태를 관리한다.
 */
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final String LOCAL_TOPIC_PREFIX = "/topic/floor/";
    private static final String GLOBAL_TOPIC = "/topic/global/chat";
    private static final String USER_CHAT_QUEUE = "/queue/chat";

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    // userId -> floorId (LOCAL 채팅 라우팅용)
    private final ConcurrentMap<UUID, UUID> userFloor = new ConcurrentHashMap<>();
    // userId -> nickname 캐시
    private final ConcurrentMap<UUID, String> userNicknames = new ConcurrentHashMap<>();

    /**
     * 채팅 입장 처리.
     */
    public void enter(UUID userId, ChatEnterRequest request) {
        userFloor.put(userId, request.getFloorId());
        String nickname = resolveNickname(userId, request.getNickname());
        userNicknames.put(userId, nickname);
    }

    /**
     * 채팅 퇴장 처리.
     */
    public void exit(UUID userId, UUID floorId) {
        UUID current = userFloor.get(userId);
        if (current == null) {
            return;
        }
        if (current.equals(floorId)) {
            userFloor.remove(userId);
        }
    }

    /**
     * 채팅 메시지 전송.
     */
    public void send(UUID userId, ChatRequest request) {
        ChatType type = request.getType();
        String content = request.getContent();
        long timestamp = System.currentTimeMillis();
        String id = UUID.randomUUID().toString();
        String senderNickname = resolveNickname(userId, null);

        switch (type) {
            case LOCAL -> {
                UUID floorId = resolveFloorId(userId, request.getFloorId());
                ChatBroadcast payload = ChatBroadcast.of(
                        id, type, content, userId, senderNickname,
                        null, null, timestamp, floorId
                );
                messagingTemplate.convertAndSend(LOCAL_TOPIC_PREFIX + floorId + "/chat", payload);
            }
            case GLOBAL -> {
                ChatBroadcast payload = ChatBroadcast.of(
                        id, type, content, userId, senderNickname,
                        null, null, timestamp, null
                );
                messagingTemplate.convertAndSend(GLOBAL_TOPIC, payload);
            }
            case WHISPER -> {
                UUID targetUserId = request.getTargetUserId();
                if (targetUserId == null) {
                    throw new BaseException(ErrorCode.INVALID_INPUT_VALUE);
                }
                String targetNickname = resolveNickname(targetUserId, request.getTargetNickname());
                ChatBroadcast payload = ChatBroadcast.of(
                        id, type, content, userId, senderNickname,
                        targetUserId, targetNickname, timestamp, null
                );
                messagingTemplate.convertAndSendToUser(targetUserId.toString(), USER_CHAT_QUEUE, payload);
                messagingTemplate.convertAndSendToUser(userId.toString(), USER_CHAT_QUEUE, payload);
            }
            case SYSTEM -> {
                UUID floorId = request.getFloorId();
                ChatBroadcast payload = ChatBroadcast.of(
                        id, type, content, userId, senderNickname,
                        null, null, timestamp, floorId
                );
                if (floorId == null) {
                    messagingTemplate.convertAndSend(GLOBAL_TOPIC, payload);
                } else {
                    messagingTemplate.convertAndSend(LOCAL_TOPIC_PREFIX + floorId + "/chat", payload);
                }
            }
            default -> throw new BaseException(ErrorCode.INVALID_INPUT_VALUE);
        }
    }

    /**
     * 세션 연결이 끊기면 상태를 정리한다.
     */
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        Principal principal = event.getUser();
        if (principal == null) {
            return;
        }
        try {
            UUID userId = UUID.fromString(principal.getName());
            removeUser(userId);
        } catch (IllegalArgumentException ignored) {
            // Principal name이 UUID 형식이 아니면 정리 대상이 아니다.
        }
    }

    private UUID resolveFloorId(UUID userId, UUID floorId) {
        UUID resolved = floorId != null ? floorId : userFloor.get(userId);
        if (resolved == null) {
            throw new BaseException(ErrorCode.INVALID_INPUT_VALUE);
        }
        return resolved;
    }

    private String resolveNickname(UUID userId, String fallback) {
        String cached = userNicknames.get(userId);
        if (cached != null) {
            return cached;
        }

        String nickname = userRepository.findById(userId)
                .map(user -> user.getNickname())
                .orElse(fallback);

        if (nickname == null || nickname.isBlank()) {
            throw new BaseException(ErrorCode.USER_NOT_FOUND);
        }

        userNicknames.put(userId, nickname);
        return nickname;
    }

    private void removeUser(UUID userId) {
        userFloor.remove(userId);
        userNicknames.remove(userId);
    }
}
