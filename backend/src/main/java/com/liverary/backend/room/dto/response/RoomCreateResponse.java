package com.liverary.backend.room.dto.response;

import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.Room;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 방 생성 완료 후 반환되는 응답 DTO 클래스입니다.
 *
 * <p>생성된 방의 고유 식별자와 (비공개 방인 경우) 초대 코드를 포함합니다.</p>
 */
@Getter
@Builder
public class RoomCreateResponse {

    private UUID roomId;
    private String code;

    /**
     * Room 엔티티를 응답 DTO로 변환하는 정적 팩토리 메서드입니다.
     *
     * @param room 생성 완료된 Room 엔티티
     * @return 변환된 RoomCreateResponse 객체
     */
    public static RoomCreateResponse from(Room room) {
        String codeResponse = (room.getAccessType() == AccessType.PRIVATE) ? room.getCode() : null;

        return RoomCreateResponse.builder()
                .roomId(room.getRoomId())
                .code(codeResponse)
                .build();
    }
}
