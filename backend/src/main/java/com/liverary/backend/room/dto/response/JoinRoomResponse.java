package com.liverary.backend.room.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 방에 참여한 후 반환되는 응답 DTO 클래스입니다.
 *
 * <p>참여한 방의 고유 식별자를 포함합니다.</p>
 */
@Getter
@Builder
public class JoinRoomResponse {
    private UUID roomId;
}
