package com.liverary.backend.friend.controller;

import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.friend.dto.request.FriendRequest;
import com.liverary.backend.friend.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/friend")
public class FriendController {

    private final FriendService friendService;

    /**
     * 인증 정보에서 현재 로그인한 사용자의 식별자 추출
     *
     * @param user Spring Security 인증 객체
     * @return 유저의 UUID
     */
    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

    /**
     * 친구 요청 보내기
     *
     * @param user  인증된 사용자 정보
     * @param request   요청 받을 상대의 이메일 정보가 담긴 요청 객체
     * @return 성공 응답
     */
    @PostMapping("/request")
    public BaseResponse<Void> sendFriendRequest(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody FriendRequest request) {

        UUID userId = getUserId(user);

        friendService.sendFriendRequest(userId, request.getReceiverEmail());

        return BaseResponse.success();
    }

    /**
     * 친구 요청 수락
     *
     * @param user  인증된 사용자 정보
     * @param friendId 친구 요청(관계)의 식별자
     * @return 성공 응답
     */
    @PatchMapping("/{friendId}/accept")
    public BaseResponse<Void> acceptFriendRequest(
            @PathVariable UUID friendId,
            @AuthenticationPrincipal UserDetails user) {

        UUID userId = getUserId(user);

        friendService.acceptFriendRequest(friendId, userId);

        return BaseResponse.success();
    }

    /**
     * 친구 요청 거절
     *
     * @param user  인증된 사용자 정보
     * @param friendId 친구 요청(관계)의 식별자
     * @return 성공 응답
     */
    @PatchMapping("/{friendId}/reject")
    public BaseResponse<Void> rejectFriendRequest(
            @PathVariable UUID friendId,
            @AuthenticationPrincipal UserDetails user) {

        UUID userId = getUserId(user);

        friendService.rejectFriendRequest(friendId, userId);

        return BaseResponse.success();
    }

}