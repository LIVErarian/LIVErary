package com.liverary.backend.move.service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Queue;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
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

    // floorId -> 이동 입력 큐 (tick에서 일괄 소비)
    private final ConcurrentMap<UUID, Queue<MoveEvent>> floorQueues = new ConcurrentHashMap<>();

    // userId -> floorId (활성 사용자 추적용)
    private final ConcurrentMap<UUID, UUID> userFloor = new ConcurrentHashMap<>();

    // floorId -> active userIds (브로드캐스트 필터링 기준)
    private final ConcurrentMap<UUID, Set<UUID>> floorUsers = new ConcurrentHashMap<>();

    /**
     * 이동 입력을 floor 큐에 적재한다.
     *
     * @param userId  이동한 사용자 ID
     * @param request 이동 입력 DTO
     */
    public void enqueue(UUID userId, MoveRequest request) {
        // 입장/활성 여부와 무관하게 먼저 큐에 적재하고 tick에서 필터링
        MoveEvent event = new MoveEvent(userId, request, System.currentTimeMillis());
        floorQueues
                .computeIfAbsent(request.getFloorId(), id -> new ConcurrentLinkedQueue<>())
                .add(event);
    }

    /**
     * 200ms tick으로 floor별 이동 입력을 묶어 브로드캐스트한다.
     */
    @Scheduled(fixedRate = 200)
    public void flushMoves() {
        floorQueues.forEach((floorId, queue) -> {
            List<MoveBroadcast> batch = drain(queue);
            if (!batch.isEmpty()) {
                // 동일 floor 구독자에게만 배치 전송
                messagingTemplate.convertAndSend(MOVE_TOPIC_PREFIX + floorId + "/move", batch);
            }
        });
    }

    /**
     * 큐에 쌓인 이동 이벤트를 drain하여 브로드캐스트용 배치로 변환한다.
     *
     * @param queue floor 이동 입력 큐
     * @return 브로드캐스트 payload 목록
     */
    private List<MoveBroadcast> drain(Queue<MoveEvent> queue) {
        List<MoveBroadcast> batch = new ArrayList<>();
        // tick 내 사용자별 마지막 이벤트만 사용
        HashMap<UUID, MoveEvent> lastEvents = new HashMap<>();
        MoveEvent event;
        while ((event = queue.poll()) != null) {
            MoveEvent previous = lastEvents.get(event.userId());
            if (previous == null
                    || event.request().getClientTs() > previous.request().getClientTs()) {
                lastEvents.put(event.userId(), event);
            }
        }

        lastEvents.forEach((userId, lastEvent) -> {
            MoveRequest request = lastEvent.request();
            // 활성 상태가 아니면 전파하지 않음
            if (!isActive(request.getFloorId(), userId)) {
                return;
            }

            // 현재 위치 사용 (저장하지 않음)
            batch.add(MoveBroadcast.of(userId, request.getFloorId(), request.getX(),
                    request.getY(), request.getDirection(), lastEvent.serverTs()));
        });
        return batch;
    }

    /**
     * floor 내 활성 사용자 여부를 반환한다.
     *
     * @param floorId floor ID
     * @param userId  사용자 ID
     * @return 활성 상태 여부
     */
    public boolean isActive(UUID floorId, UUID userId) {
        Set<UUID> users = floorUsers.get(floorId);
        return users != null && users.contains(userId);
    }

    /**
     * 사용자를 floor에 등록하거나 floor 변경을 반영한다.
     *
     * @param userId  사용자 ID
     * @param request floor 입장 요청
     */
    public void touch(UUID userId, MoveEnterRequest request) {
        UUID previousFloor = userFloor.put(userId, request.getFloorId());
        // 기존 floor가 다르면 해당 floor의 활성 집합에서 제거
        if (previousFloor != null && !previousFloor.equals(request.getFloorId())) {
            removeFromFloor(previousFloor, userId);
        }

        floorUsers
                .computeIfAbsent(request.getFloorId(), id -> ConcurrentHashMap.newKeySet())
                .add(userId);
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
        removeFromFloor(floorId, userId);
    }

    /**
     * 사용자 연결 종료 시 모든 floor에서 제거한다.
     *
     * @param userId 사용자 ID
     */
    public void removeUser(UUID userId) {
        UUID floorId = userFloor.remove(userId);
        if (floorId != null) {
            removeFromFloor(floorId, userId);
        }
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

    /**
     * 이동 이벤트 큐에 저장되는 항목.
     */
    private record MoveEvent(UUID userId, MoveRequest request, long serverTs) {}
}
