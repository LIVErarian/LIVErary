package com.liverary.backend.chat.dto.request;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 채팅 퇴장 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class ChatExitRequest {

    @NotNull
    private UUID floorId;
}
