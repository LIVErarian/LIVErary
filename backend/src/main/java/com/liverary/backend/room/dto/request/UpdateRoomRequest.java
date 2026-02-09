package com.liverary.backend.room.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 라이브 방 수정 요청 정보를 전달하는 DTO 클래스입니다.
 *
 * <p>방 제목, 인원, 책 정보, 카테고리를 입력받습니다. </p>
 */
@Getter
@NoArgsConstructor
public class UpdateRoomRequest {
    private String title;
    private Integer maxUser;
    private String isbn;
    private UUID categoryId;
}
