package com.liverary.backend.move.dto.request;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * floor 퇴장 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class MoveExitRequest {

    // 퇴장할 floor ID
    @NotNull
    private UUID floorId;
}
