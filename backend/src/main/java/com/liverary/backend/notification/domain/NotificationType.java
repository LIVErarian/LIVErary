package com.liverary.backend.notification.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationType {
    RESERVATION("세션 예약 알림 (시작 / 종료 10분 전)"),
    FRIEND_REQUEST("친구 요청 알림"),
    BOARD_REPLY("문의 답변 알림");

    private final String description;


}
