package com.liverary.backend.attendance.dto.response;

import com.liverary.backend.attendance.domain.AttendanceType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

/**
 * 일일 출석 체크 응답 DTO
 */
@Getter
@Builder
public class DailyAttendanceResponse {

    private UUID attendanceId;
    private AttendanceType attendanceType;
    private LocalDate attendedAt;
    private Integer consecutiveDays;
    private Boolean isFirstTimeToday;
}
