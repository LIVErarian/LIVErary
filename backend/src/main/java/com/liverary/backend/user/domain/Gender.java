package com.liverary.backend.user.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 사용자의 성별 정보를 관리하는 Enum 클래스입니다.
 */
@Getter
@AllArgsConstructor
public enum Gender {
    MALE("남성"),
    FEMALE("여성");

    private final String description;
}
