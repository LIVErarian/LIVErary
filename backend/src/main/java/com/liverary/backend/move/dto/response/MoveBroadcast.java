package com.liverary.backend.move.dto.response;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import com.liverary.backend.move.dto.Direction;
import lombok.Builder;
import lombok.Getter;

/**
 * floor 내 참여자들에게 브로드캐스트되는 이동 이벤트 DTO.
 */
@Getter
@Builder
public class MoveBroadcast {

    // 이동한 사용자 ID
    @NotNull
    private UUID userId;

    // 이동이 발생한 floor ID
    @NotNull
    private UUID floorId;

    // 현재 위치
    @NotNull
    private Double x;
    @NotNull
    private Double y;

    // 현재 방향
    @NotNull
    private Direction direction;

    // 서버 수신 시각 (epoch millis)
    @NotNull
    private Long serverTs;

    public static MoveBroadcast of(UUID userId, UUID floorId, Double x, Double y, Direction direction,
                                   Long serverTs) {
        return MoveBroadcast.builder()
                .userId(userId)
                .floorId(floorId)
                .x(x)
                .y(y)
                .direction(direction)
                .serverTs(serverTs)
                .build();
    }
}
