package com.liverary.backend.move.service;

import java.security.Principal;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import lombok.RequiredArgsConstructor;
import com.liverary.backend.move.dto.request.MoveEnterRequest;
import com.liverary.backend.move.dto.request.MoveRequest;
import com.liverary.backend.move.dto.response.MoveBroadcast;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * floor별 이동 입력을 처리하고 tick 주기로 브로드캐스트하는 서비스.
 */
@Service
@RequiredArgsConstructor
public class MoveService {

    private static final String MOVE_TOPIC_PREFIX = "/topic/floor/";
    private final SimpMessagingTemplate messagingTemplate;

    // userId -> floorId (활성 사용자 추적용)
    private final ConcurrentMap<UUID, UUID> userFloor = new ConcurrentHashMap<>();

    // floorId -> active userIds (브로드캐스트 필터링 기준)
    private final ConcurrentMap<UUID, Set<UUID>> floorUsers = new ConcurrentHashMap<>();

    // userId -> 마지막 위치 스냅샷
    private final ConcurrentMap<UUID, MoveBroadcast> userPositions = new ConcurrentHashMap<>();

    /**
     * 사용자의 마지막 위치를 갱신한다.
     *
     * @param userId  이동한 사용자 ID
     * @param request 이동 입력 DTO
     */
    public void enqueue(UUID userId, MoveRequest request) {
        long serverTs = System.currentTimeMillis();
        // 최신 위치 캐시
        userPositions.put(userId, MoveBroadcast.of(
                userId,
                request.getFloorId(),
                request.getX(),
                request.getY(),
                request.getDirection(),
                serverTs,
                request.getIsMoving()
        ));
    }

    /**
     * 200ms tick으로 floor별 모든 사용자 위치를 브로드캐스트한다.
     */
    @Scheduled(fixedRate = 200)
    public void flushMoves() {
        floorUsers.forEach((floorId, users) -> {
            List<MoveBroadcast> batch = snapshot(floorId);
            if (batch.isEmpty()) {
                return;
            }

            // 동일 floor 구독자에게만 배치 전송
            messagingTemplate.convertAndSend(MOVE_TOPIC_PREFIX + floorId + "/move", batch);
        });
    }


    /**
     * 사용자를 floor에 등록하거나 floor 변경을 반영한다.
     *
     * @param userId  사용자 ID
     * @param request floor 입장 요청
     */
    public void touch(UUID userId, MoveEnterRequest request) {
        UUID previousFloor = userFloor.get(userId);
        // 기존 floor가 다르면 해당 floor의 활성 집합에서 제거
        if (previousFloor != null && !previousFloor.equals(request.getFloorId())) {
            Set<UUID> users = floorUsers.get(previousFloor);
            if (users != null) {
                users.remove(userId);
                if (users.isEmpty()) {
                    floorUsers.remove(previousFloor, users);
                }
            }
        }

        userFloor.put(userId, request.getFloorId());
        floorUsers
                .computeIfAbsent(request.getFloorId(), id -> ConcurrentHashMap.newKeySet())
                .add(userId);

        // 입장 시 초기 위치 저장 (정지 상태로 간주)
        userPositions.put(userId, MoveBroadcast.of(
                userId,
                request.getFloorId(),
                request.getX(),
                request.getY(),
                request.getDirection(),
                System.currentTimeMillis(),
                false
        ));
    }

    /**
     * 사용자를 특정 floor에서 제거한다.
     *
     * @param userId  사용자 ID
     * @param floorId floor ID
     */
    public void removeFromFloor(UUID userId, UUID floorId) {
        UUID currentFloor = userFloor.get(userId);
        // 다른 floor에 있거나 이미 제거된 경우 무시
        if (currentFloor == null || !currentFloor.equals(floorId)) {
            return;
        }

        userFloor.remove(userId);
        Set<UUID> users = floorUsers.get(floorId);
        if (users != null) {
            users.remove(userId);
            if (users.isEmpty()) {
                floorUsers.remove(floorId, users);
            }
        }
        userPositions.remove(userId);
    }

    /**
     * 사용자 연결 종료 시 모든 floor에서 제거한다.
     *
     * @param userId 사용자 ID
     */
    public void removeUser(UUID userId) {
        UUID floorId = userFloor.get(userId);
        if (floorId != null) {
            removeFromFloor(userId, floorId);
        } else {
            userPositions.remove(userId);
        }
    }


    /**
     * floor의 활성 사용자 현재 위치 스냅샷을 반환한다.
     *
     * @param floorId floor ID
     * @return 활성 사용자들의 마지막 위치 목록
     */
    public List<MoveBroadcast> snapshot(UUID floorId) {
        Set<UUID> users = floorUsers.get(floorId);
        if (users == null || users.isEmpty()) {
            return List.of();
        }

        return users.stream()
                .map(userPositions::get)
                .filter(position -> position != null && floorId.equals(position.getFloorId()))
                .collect(Collectors.toList());
    }

    /**
     * 세션 연결이 끊기면 자원을 정리한다.
     *
     * @param event 세션 종료 이벤트
     */
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        Principal principal = event.getUser();
        if (principal == null) {
            return;
        }

        // 연결 종료 시 모든 floor 상태 정리
        removeUser(UUID.fromString(principal.getName()));
    }

}
