package com.liverary.backend.room.dto.response;

import com.liverary.backend.room.domain.Room;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 내가 예약 신청한 방을 조회했을 때 반환되는 응답 DTO 클래스입니다.
 */
@Getter
@Builder
public class MyReservationResponse {
    private UUID roomId;
    private String title;

    public static MyReservationResponse from(Room room) {
        return MyReservationResponse.builder()
                .roomId(room.getRoomId())
                .title(room.getTitle())
                .build();
    }
}
