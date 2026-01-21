package com.liverary.backend.bookHistory.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BookStatus {
    WISH("찜한 책"),
    READING("읽고 있는 책"),
    COMPLETED("다 읽은 책");

    private final String description;
}



