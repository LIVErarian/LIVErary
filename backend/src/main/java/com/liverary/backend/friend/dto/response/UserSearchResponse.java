package com.liverary.backend.friend.dto.response;

import com.liverary.backend.friend.domain.FriendStatus;
import com.liverary.backend.user.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UserSearchResponse {

    private UUID userId;        // 친구 신청 API 호출을 위해 필요
    private String email;
    private String nickname;
    private FriendStatus relationStatus;    // 이미 친구인지, 요청 중인지 확인하여 버튼 분기

    public static UserSearchResponse of(User user, FriendStatus status) {
        return UserSearchResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .relationStatus(status)
                .build();
    }

}