package com.liverary.backend.socket.dto.request;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 방 참여 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class ConnectRoomRequest {

    // 사용자가 참여할 방 ID
    @NotNull
    private UUID roomId;
}
