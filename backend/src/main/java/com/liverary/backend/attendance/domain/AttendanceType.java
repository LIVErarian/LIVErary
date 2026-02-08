package com.liverary.backend.attendance.domain;

/**
 * 출석 타입을 정의하는 Enum
 */
public enum AttendanceType {
    DAILY, // 일일 출석
    READING // 독서 출석 (30분 이상 독서 시 자동 기록)
}
