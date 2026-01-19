package com.liverary.backend.room.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 방의 접속 이력에서 입장/퇴장 상태를 정의하는 Enum 입니다.
 */
@Getter
@AllArgsConstructor
public enum HistoryStatus {
    JOINED("입장"),
    LEFT("퇴장");

    private final String description;
}
