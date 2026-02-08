package com.liverary.backend.attendance.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

/**
 * 출석 이력 응답 DTO
 */
@Getter
@Builder
public class AttendanceHistoryResponse {

    private LocalDate attendanceDate;
    private Boolean hasDailyAttendance;
    private Boolean hasReadingAttendance;
}
