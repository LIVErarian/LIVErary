package com.liverary.backend.friend.controller;

import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.friend.dto.request.BlockRequest;
import com.liverary.backend.friend.dto.request.FriendRequest;
import com.liverary.backend.friend.dto.response.FriendResponse;
import com.liverary.backend.friend.service.FriendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
     * @param user  Spring Security 인증 객체
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
     * @param user      인증된 사용자 정보
     * @param request   요청 받을 상대의 이메일 정보가 담긴 요청 객체
     * @return 성공 응답
     */
    @PostMapping("/request")
    public BaseResponse<Void> sendFriendRequest(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody FriendRequest request) {

        UUID userId = getUserId(user);

        friendService.sendFriendRequest(userId, request.getReceiverEmail());

        return BaseResponse.success();
    }

    /**
     * 친구 요청 수락
     *
     * @param user      인증된 사용자 정보
     * @param friendId  친구 요청(관계)의 식별자
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
     * @param user      인증된 사용자 정보
     * @param friendId  친구 요청(관계)의 식별자
     * @return 성공 응답
     */
    @DeleteMapping("/{friendId}/reject")
    public BaseResponse<Void> rejectFriendRequest(
            @PathVariable UUID friendId,
            @AuthenticationPrincipal UserDetails user) {

        UUID userId = getUserId(user);

        friendService.rejectFriendRequest(friendId, userId);

        return BaseResponse.success();
    }

    /**
     * 사용자 차단
     *
     * @param user      인증된 사용자 정보
     * @param request   차단할 사용자 정보를 담은 요청 객체
     * @return
     */
    @PostMapping("/block")
    public BaseResponse<Void> blockUser(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody BlockRequest request) {

        UUID userId = getUserId(user);

        friendService.blockUser(userId, request.getEmail());

        return BaseResponse.success();
    }

    /**
     * 사용자 차단 해제
     *
     * @param user      인증된 사용자 정보
     * @param request   차단해제 사용자 정보를 담은 요청 객체
     * @return  성공 응답
     */
    @PostMapping("/unblock")
    public BaseResponse<Void> unblockUser(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody BlockRequest request) {

        UUID userId = getUserId(user);

        friendService.unblockUser(userId, request.getEmail());

        return BaseResponse.success();
    }

    /**
     * 내 친구 목록 조회 (ACCEPTED 상태)
     *
     * @param user      인증된 사용자 정보
     * @param pageable  페이징 설정 (기본값: 페이지당 10개 항목)
     * @return  페이징 된 "내 친구 목록"을 담은 응답
     */
    @GetMapping("/accepts")
    public BaseResponse<Page<FriendResponse>> getAcceptedFriends(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 10) Pageable pageable) {

        UUID userId = getUserId(user);

        Page<FriendResponse> responses = friendService.getAcceptedFriends(userId, pageable);

        return BaseResponse.success(responses);
    }

    /**
     * 받은 친구 요청 목록 조회 (PENDING 상태)
     *
     * @param user      인증된 사용자 정보
     * @param pageable  페이징 설정 (기본값: 페이지당 10개 항목)
     * @return  페이징 된 "받은 친구 요청 목록"을 담은 응답
     */
    @GetMapping("/requests")
    public BaseResponse<Page<FriendResponse>> getPendingRequests(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 10) Pageable pageable) {

        UUID userId = getUserId(user);

        Page<FriendResponse> responses = friendService.getPendingRequests(userId, pageable);

        return BaseResponse.success(responses);
    }

    /**
     * 차단 목록 조회 (BLOCKED 상태)
     *
     * @param user      인증된 사용자 정보
     * @param pageable  페이징 설정 (기본값: 페이지당 10개 항목)
     * @return  페이징 된 "차단 목록"을 담은 응답
     */
    @GetMapping("/blocks")
    public BaseResponse<Page<FriendResponse>> getBlockedFriends(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 10) Pageable pageable) {

        UUID userId = getUserId(user);

        Page<FriendResponse> responses = friendService.getBlockedFriends(userId, pageable);

        return BaseResponse.success(responses);
    }

}