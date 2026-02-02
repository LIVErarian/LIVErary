package com.liverary.backend.room.dto.response;

import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.Room;
import lombok.Builder;
import lombok.Getter;

/**
 * 예약 방에 예약 신청 완료 후 반환되는 응답 DTO 클래스입니다.
 */
@Getter
@Builder
public class ApplyReservationResponse {
    private String code;

    /**
     * Room 엔티티를 응답 DTO로 변환하는 정적 팩토리 메서드입니다.
     *
     * @param room 예약 신청한 Room 엔티티
     * @return 변환된 ApplyReservationResponse 객체
     */
    public static ApplyReservationResponse from(Room room) {
        String codeResponse = room.getCode();

        return ApplyReservationResponse.builder()
                .code(codeResponse)
                .build();
    }
}
