package com.liverary.backend.friend.dto.response;

import com.liverary.backend.friend.domain.Friend;
import com.liverary.backend.friend.domain.FriendStatus;
import com.liverary.backend.user.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 친구 관계 정보와 상대방의 프로필 데이터를 담는 응답 객체
 */
@Getter
@Builder
public class FriendResponse {

    private UUID friendId;
    private String email;
    private String nickname;
    private FriendStatus status;

    /**
     * 친구 엔티티와 상대방 유저 객체를 기반으로 응답 객체 생성
     *
     * @param friend    관계 정보가 담긴 친구 엔티티
     * @param otherUser 정보를 추출할 대상 유저 객체
     * @return 상태값과 유저 정보가 포함된 FriendResponse 객체
     */
    public static FriendResponse of(Friend friend, User otherUser) {
        return FriendResponse.builder()
                .friendId(friend.getFriendId())
                .email(otherUser.getEmail())
                .nickname(otherUser.getNickname())
                .status(friend.getStatus())
                .build();
    }

}