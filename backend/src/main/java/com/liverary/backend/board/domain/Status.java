package com.liverary.backend.board.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 게시글 상태 (답변대기, 답변완료)
 */
@Getter
@AllArgsConstructor
public enum Status {
    PENDING("답변대기"),
    DONE("답변완료");

    private final String description;
}
