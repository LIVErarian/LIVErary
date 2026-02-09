package com.liverary.backend.board.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 게시글 유형 (홍보, 문의, 공지)
 */
@Getter
@AllArgsConstructor
public enum Type {
    PROMOTION("홍보"),
    INQUIRY("문의"),
    NOTICE("공지");

    private final String description;
}
