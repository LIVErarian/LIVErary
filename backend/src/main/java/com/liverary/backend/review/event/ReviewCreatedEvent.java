package com.liverary.backend.review.event;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.user.domain.User;

/**
 * 댓글 생성 시 발생하는 이벤트 객체 (record - 불변 객체)
 */
public record ReviewCreatedEvent (
    User receiver, // 알림을 받을 대상 (게시글 작성자)
    Board board // 댓글이 달린 게시글
) {}
