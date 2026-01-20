package com.liverary.backend.board.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 게시글 상태 (답변대기, 답변완료, 게시완료)
 */
@Getter
@AllArgsConstructor
public enum Status {
    // 문의글
    PENDING("답변대기"),
    DONE("답변완료"),
    // 공지, 홍보글
    POSTED("게시완료");

    private final String description;
}
