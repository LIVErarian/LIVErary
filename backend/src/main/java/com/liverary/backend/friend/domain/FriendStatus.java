package com.liverary.backend.friend.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 친구의 요청 상태를 정의하는 Enum 클래스
 */
@Getter
@RequiredArgsConstructor
public enum FriendStatus {

    PENDING("대기"),
    ACCEPTED("수락"),
    REJECTED("거절");

    private final String description;

}