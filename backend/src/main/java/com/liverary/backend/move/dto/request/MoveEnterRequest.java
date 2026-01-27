package com.liverary.backend.move.dto.request;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * floor 입장 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class MoveEnterRequest {

    // 입장할 floor ID
    @NotNull
    private UUID floorId;

    // 현재 위치 x 좌표
    @NotNull
    private Double x;

    // 현재 위치 y 좌표
    @NotNull
    private Double y;
}
