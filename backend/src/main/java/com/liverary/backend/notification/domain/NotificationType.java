package com.liverary.backend.notification.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationType {
    RESERVATION("세션 예약 알림 (시작 / 종료 10분 전)"),
    FRIEND_REQUEST("친구 요청 알림"),
    INQUIRY_REVIEW("문의 답변 알림"), // 문의 게시글에 달린 답변
    BOARD_REVIEW("게시글 댓글 알림"); // 일반 게시글(홍보)에 달린 댓글

    private final String description;


}
