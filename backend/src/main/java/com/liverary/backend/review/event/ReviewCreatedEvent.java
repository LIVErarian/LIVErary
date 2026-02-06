package com.liverary.backend.review.event;


import java.util.UUID;

/**
 * 댓글 생성 시 발생하는 이벤트 객체 (record - 불변 객체)
 */
public record ReviewCreatedEvent (
        UUID receiverId, // 알림을 받을 대상 id (게시글 작성자)
        UUID boardId // 댓글이 달린 게시글 id
) {}
