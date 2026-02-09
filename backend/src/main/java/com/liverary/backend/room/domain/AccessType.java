package com.liverary.backend.room.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 방의 공개/비공개 여부를 정의하는 Enum 입니다.
 */
@Getter
@AllArgsConstructor
public enum AccessType {
    PUBLIC("공개"),
    PRIVATE("비공개");

    private final String description;
}