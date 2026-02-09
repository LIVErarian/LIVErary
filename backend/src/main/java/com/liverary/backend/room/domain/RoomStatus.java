package com.liverary.backend.room.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 방의 진행 상태를 정의하는 Enum 입니다.
 */
@Getter
@AllArgsConstructor
public enum RoomStatus {
    SCHEDULED("예약"),
    LIVE("진행 중"),
    FINISHED("종료");

    private final String description;
}