package com.liverary.backend.room.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 방 (Room) 참여 요청 정보를 전달하는 DTO 클래스입니다.
 *
 * <p>비공개 방인 경우 참여코드를 입력받습니다.</p>
 */
@Getter
@NoArgsConstructor
public class JoinRoomRequest {
    private String code;
}
