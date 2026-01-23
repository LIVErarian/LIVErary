package com.liverary.backend.socket.util;

import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

/**
 * 사용자 ID 기반으로 WebRTC 세션을 보관/조회하는 레지스트리.
 */
@Component
public class UserSessionRegistry {

    // 사용자 ID -> 세션 매핑
    private final ConcurrentHashMap<UUID, UserSession> usersByUserId = new ConcurrentHashMap<>();

    /**
     * 사용자 세션을 등록한다.
     *
     * @param user 등록할 사용자 세션
     */
    public void register(UserSession user) {
        usersByUserId.put(user.getUserId(), user);
    }

    /**
     * 사용자 ID로 세션을 조회한다.
     *
     * @param userId 사용자 ID
     * @return 사용자 세션
     */
    public UserSession getByUserId(UUID userId) {
        return Optional.ofNullable(usersByUserId.get(userId))
                .orElseThrow(() -> new RuntimeException("해당 user의 session이 존재하지 않습니다."));
    }

    /**
     * 사용자 ID로 세션을 제거한다.
     *
     * @param userId 사용자 ID
     * @return 제거된 세션
     */
    public UserSession removeByUserId(UUID userId) {
        return Optional.ofNullable(usersByUserId.remove(userId))
                .orElseThrow(() -> new RuntimeException("해당 user의 session이 존재하지 않습니다."));
    }

}
