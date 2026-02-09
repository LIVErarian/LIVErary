package com.liverary.backend.room.dto.request;

import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.RoomStatus;
import com.liverary.backend.room.domain.RoomType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 방 (Room) 생성 요청 정보를 전달하는 DTO 클래스입니다.
 *
 * <p>클라이언트로부터 방 생성에 필요한 제목, 유형, 인원 설정 등을 입력받습니다.
 * 입력값에 대한 예약 방과 라이브 방의 유효성 검증(Validation)을 수행합니다.</p>
 */
@Getter
@NoArgsConstructor
public class RoomCreateRequest {

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

    private RoomStatus status = RoomStatus.LIVE;

    private String isbn;
    private UUID categoryId;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    // 예약 여부에 따라 시작, 종료 시각을 검증합니다.
    @AssertTrue(message = "예약 생성 시 시작/종료 시간은 필수이며, 종료 시각은 시작 시각 이후여야 합니다.")
    private boolean isValidTimeConfiguration() {
        // status가 null일 경우 LIVE 방으로 간주
        if (this.status == null) {
            this.status = RoomStatus.LIVE;
        }

        // 즉시 시작(LIVE)인 경우, 시간 정보 불필요
        if (this.status == RoomStatus.LIVE) {
            return true;
        }

        // 예약(SCHEDULED)인 경우, 시간 입력 필수
        if (this.status == RoomStatus.SCHEDULED) {
            if (startAt == null || endAt == null) {
                return false;
            }
            return endAt.isAfter(startAt);
        }

        return true;
    }
}
