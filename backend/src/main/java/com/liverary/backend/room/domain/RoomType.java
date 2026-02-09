package com.liverary.backend.room.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 접속한 방의 유형을 정의하는 Enum 입니다.
 */
@Getter
@AllArgsConstructor
public enum RoomType {
    STABLE("상시 오픈방"),
    READING("독서실"),
    TALK("대화방"),
    CONCERT("북콘서트");

    private final String description;
}