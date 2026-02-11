package com.liverary.backend.chat.dto.request;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 채팅 입장 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class ChatEnterRequest {

    // 입장한 맵 ID
    @NotNull
    private UUID floorId;

    // 입장한 사람 닉네임 (서버가 알지만 명시적으로 보냄)
    private String nickname;
}
