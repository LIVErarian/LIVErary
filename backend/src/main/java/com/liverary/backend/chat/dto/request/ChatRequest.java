package com.liverary.backend.chat.dto.request;

import java.util.UUID;
import com.liverary.backend.chat.dto.BaseChat;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 채팅 전송 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class ChatRequest extends BaseChat {

    // LOCAL 채팅일 때 필수
    private UUID floorId;

    // 귓속말일 때 필수, ID
    private UUID targetUserId;

    // 표시용 닉네임
    private String targetNickname;
}
