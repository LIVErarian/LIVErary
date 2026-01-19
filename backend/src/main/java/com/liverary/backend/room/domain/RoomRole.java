package com.liverary.backend.room.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 참여한 방에서의 역할 및 범위를 정의하는 Enum 입니다.
 */
@Getter
@AllArgsConstructor
public enum RoomRole {
    GUEST("게스트"),
    MANAGER("관리자"),
    AUTHOR("작가");

    private final String description;
}