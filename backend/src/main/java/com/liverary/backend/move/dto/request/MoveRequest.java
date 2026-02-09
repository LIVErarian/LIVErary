package com.liverary.backend.move.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import com.liverary.backend.move.dto.Direction;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자의 이동 입력을 전달하는 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class MoveRequest {

    // 이동이 발생한 floor ID
    @NotNull
    private UUID floorId;

    // 현재 위치(절대 좌표)
    @NotNull
    private Double x;
    @NotNull
    private Double y;

    // 현재 방향
    @NotNull
    private Direction direction;

    // 클라이언트 기준 입력 시각 (epoch millis)
    @NotNull
    private Long clientTs;

    // 사용자가 움직이고 있는지
    @NotNull
    private Boolean isMoving;

    // 사용자가 앉아 있는지
    @NotNull
    private Boolean isSitting;
}
