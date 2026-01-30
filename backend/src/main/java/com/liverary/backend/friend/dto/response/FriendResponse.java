package com.liverary.backend.friend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FriendResponse {

    private java.util.UUID friendId;
    private String email;
    private String nickname;

}