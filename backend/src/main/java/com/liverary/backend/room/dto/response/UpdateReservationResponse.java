package com.liverary.backend.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

/**
 * 방 예약 수정 완료 후 반환되는 응답 DTO 클래스입니다.
 *
 * <p>수정한 방의 고유 식별자와 초대 코드를 포함합니다.</p>
 */
@Getter
@AllArgsConstructor
public class UpdateReservationResponse {
    private UUID roomId;
    private String code;
}
