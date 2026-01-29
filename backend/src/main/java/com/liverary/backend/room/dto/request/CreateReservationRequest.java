package com.liverary.backend.room.dto.request;

import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.RoomType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 방 예약 (RoomReservation) 생성 요청 정보를 전달하는 DTO 클래스입니다.
 */
@Getter
@NoArgsConstructor
public class CreateReservationRequest {

    @NotBlank(message = "방 제목은 필수입니다.")
    private String title;

    @NotNull(message = "방 유형은 필수입니다.")
    private RoomType roomType;

    @NotNull(message = "공개 여부는 필수입니다.")
    private AccessType accessType;

    @NotNull(message = "최대 인원은 필수입니다.")
    @Min(value = 1, message = "최소 인원은 1명입니다.")
    @Max(value = 16, message = "최대 인원은 16명입니다.")
    private Integer maxUser;

    private String isbn;
    private UUID categoryId;

    @NotNull(message = "예약 시작 시각은 필수입니다.")
    @Future(message = "시작 시각은 현재보다 미래여야 합니다.")
    private LocalDateTime startAt;

    @NotNull(message = "종료 시각은 필수입니다.")
    @Future(message = "종료 시각은 현재보다 미래여야 합니다.")
    private LocalDateTime endAt;

    // 종료 시각이 시작 시각 이후인지 확인합니다.
    @AssertTrue(message = "종료 시각은 시작 시각 이후여야 합니다.")
    private boolean isEndAtAfterStartAt() {
        if (startAt == null || endAt == null) {
            return true;
        }
        return endAt.isAfter(startAt);
    }
}

