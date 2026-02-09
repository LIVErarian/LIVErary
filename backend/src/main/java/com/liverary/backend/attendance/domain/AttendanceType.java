package com.liverary.backend.attendance.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 출석 타입을 정의하는 Enum
 */
@Getter
@AllArgsConstructor
public enum AttendanceType {
    DAILY("일일 출석"),
    READING("독서 출석");

    private final String description;
}
