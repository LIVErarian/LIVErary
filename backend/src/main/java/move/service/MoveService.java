package move.service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ConcurrentMap;

import lombok.RequiredArgsConstructor;
import move.dto.request.MoveEnterRequest;
import move.dto.request.MoveRequest;
import move.dto.response.MoveBroadcast;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * floor별 이동 입력을 누적 처리하고 tick 주기로 브로드캐스트하는 서비스.
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

    // 사용자별 현재 위치 (delta 누적 계산의 기준점)
    private final ConcurrentMap<UUID, Position> userPositions = new ConcurrentHashMap<>();

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
        MoveEvent event;
        while ((event = queue.poll()) != null) {
            MoveRequest request = event.request();
            // 활성 상태가 아니면 전파하지 않음
            if (!isActive(request.getFloorId(), event.userId())) {
                continue;
            }

            // delta 누적 후 현재 위치 계산
            Position currentPosition = computePosition(event.userId(), event.request());
            batch.add(MoveBroadcast.of(event.userId(), request.getFloorId(), currentPosition.x,
                    currentPosition.y(), event.serverTs()));
        }
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

        // 입장 시 초기 위치 등록
        userPositions.put(userId, new Position(request.getX(), request.getY()));
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
        // 위치 상태도 함께 정리
        userPositions.remove(userId);
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
     * 이동량을 누적해 현재 위치를 계산하고 저장한다.
     *
     * @param userId  사용자 ID
     * @param request 이동 입력 DTO
     * @return 계산된 현재 위치
     */
    private Position computePosition(UUID userId, MoveRequest request) {
        Position position = userPositions.get(userId);
        double nextX = request.getX();
        double nextY = request.getY();
        if (position != null) {
            // delta 누적 계산
            nextX = position.x() + request.getX();
            nextY = position.y() + request.getY();
        }

        Position next = new Position(nextX, nextY);
        // 계산된 최신 위치를 저장
        userPositions.put(userId, next);
        return next;
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
     * 사용자 좌표를 나타내는 불변 레코드.
     */
    private record Position(Double x, Double y) {}

    /**
     * 이동 이벤트 큐에 저장되는 항목.
     */
    private record MoveEvent(UUID userId, MoveRequest request, long serverTs) {}
}
