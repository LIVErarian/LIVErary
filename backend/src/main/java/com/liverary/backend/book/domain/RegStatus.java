package com.liverary.backend.book.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RegStatus {
    APPROVED("승인 완료"),
    PENDING("승인 대기");

    private final String description;
}
