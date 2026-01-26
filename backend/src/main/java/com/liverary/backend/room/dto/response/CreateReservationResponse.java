package com.liverary.backend.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

/**
 * 방 예약 생성 완료 후 반환되는 응답 DTO 클래스입니다.
 *
 * <p>생성된 방의 고유 식별자와 초대 코드를 포함합니다.</p>
 */
@Getter
@AllArgsConstructor
public class CreateReservationResponse {
    private UUID roomId;
    private String code;
}
