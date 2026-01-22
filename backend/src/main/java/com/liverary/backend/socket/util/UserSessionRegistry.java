package com.liverary.backend.socket.util;

import org.springframework.stereotype.Component;

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
     * @return 사용자 세션, 없으면 null
     */
    public UserSession getByUserId(UUID userId) {
        return usersByUserId.get(userId);
    }

    /**
     * 사용자 ID로 세션을 제거한다.
     *
     * @param userId 사용자 ID
     * @return 제거된 세션, 없으면 null
     */
    public UserSession removeByUserId(UUID userId) {
        // 먼저 조회해 존재 여부를 확인
        final UserSession user = getByUserId(userId);
        if (user == null) {
            return null;
        }
        // 존재 시 매핑에서 제거
        usersByUserId.remove(user.getUserId());
        return user;
    }

}
