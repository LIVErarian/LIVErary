package com.liverary.backend.room.dto.request;


import jakarta.validation.constraints.Future;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 방 예약 수정 요청 정보를 전달하는 DTO 클래스입니다.
 *
 * <p>방 제목, 인원, 예약 일정, 카테고리 설정 등을 입력받습니다. </p>
 */
@Getter
@NoArgsConstructor
public class UpdateReservationRequest {
    private String title;
    private Integer maxUser;

    @Future(message = "시작 시각은 현재보다 미래여야 합니다.")
    private LocalDateTime startAt;

    @Future(message = "종료 시각은 현재보다 미래여야 합니다.")
    private LocalDateTime endAt;

    private UUID bookId;
    private UUID categoryId;
}
