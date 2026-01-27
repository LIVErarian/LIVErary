package move.dto.response;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;
import move.dto.request.MoveRequest;

/**
 * floor 내 참여자들에게 브로드캐스트되는 이동 이벤트 DTO.
 */
@Getter
@Builder
public class MoveBroadcast {

    // 이동한 사용자 ID
    private UUID userId;

    // 이동이 발생한 floor ID
    private UUID floorId;

    // 현재 위치
    private double x;
    private double y;

    // 서버 수신 시각 (epoch millis)
    private long serverTs;

    public static MoveBroadcast of(UUID userId, UUID floorId, Double x, Double y, Long serverTs) {
        return MoveBroadcast.builder()
                .userId(userId)
                .floorId(floorId)
                .x(x)
                .y(y)
                .serverTs(serverTs)
                .build();
    }
}
