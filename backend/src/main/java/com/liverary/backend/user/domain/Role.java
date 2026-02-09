package com.liverary.backend.user.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 사용자의 시스템 권한을 정의하는 Enum 클래스입니다.
 */
@Getter
@AllArgsConstructor
public enum Role {
    USER("사용자"),
    ADMIN("관리자");

    private final String description;
}
