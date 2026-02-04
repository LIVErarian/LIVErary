package com.liverary.backend.user.controller;

import com.liverary.backend.bookHistory.domain.BookStatus;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.dto.request.UserPreferenceCreateRequest;
import com.liverary.backend.user.dto.request.UserPreferenceUpdateRequest;
import com.liverary.backend.user.dto.request.UserUpdateRequest;
import com.liverary.backend.user.dto.response.BookSummary;
import com.liverary.backend.user.dto.response.OtherProfileResponse;
import com.liverary.backend.user.dto.response.ProfileResponse;
import com.liverary.backend.user.dto.response.UserPreferenceResponse;
import com.liverary.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 회원 정보 조회 및 관리를 처리하는 API 컨트롤러
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

    /**
     * 현재 로그인한 사용자의 마이페이지 정보 조회
     *
     * @param user     인증된 사용자 정보
     * @return 성공 시 ProfileResponse를 담은 BaseResponse
     */
    @GetMapping
    public BaseResponse<ProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails user) {

        UUID userId = getUserId(user);

        ProfileResponse response = userService.getProfile(userId);

        return BaseResponse.success(response);
    }

    /**
     * 특정 상태의 도서 목록을 페이징하여 조회
     *
     * @param user   인증된 사용자 정보
     * @param status 조회할 도서 상태
     * @param pageable 페이징 설정 (기본값: 페이지당 10개 항목)
     * @return 페이징된 도서 목록을 담은 BaseResponse
     */
    @GetMapping("/books")
    public BaseResponse<Page<BookSummary>> getMyBooks(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam BookStatus status,
            @PageableDefault(size = 10) Pageable pageable) {

        UUID userId = getUserId(user);

        Page<BookSummary> response = userService.getUserBooksByStatus(userId, status, pageable);

        return BaseResponse.success(response);
    }

    /**
     * 사용자의 프로필 정보 수정
     *
     * @param user    인증된 사용자 정보
     * @param request 수정할 프로필 정보 객체
     * @return 성공 응답
     */
    @PatchMapping
    public BaseResponse<Void> updateProfile(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody UserUpdateRequest request) {

        UUID userId = getUserId(user);

        userService.updateProfile(userId, request);

        return BaseResponse.success();
    }

    /**
     * 사용자의 선호 카테고리를 최초 등록
     *
     * @param user    인증된 사용자 정보
     * @param request 등록할 카테고리 정보 객체
     * @return 성공 응답
     */
    @PostMapping("/preferences")
    public BaseResponse<Void> createPreferences(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody UserPreferenceCreateRequest request) {

        UUID userId = getUserId(user);

        userService.createUserPreferences(userId, request.getCategoryIds());

        return BaseResponse.success();
    }

    /**
     * 사용자의 선호 카테고리 정보 수정
     *
     * @param user    인증된 사용자 정보
     * @param request 수정할 카테고리 정보 객체
     * @return 성공 응답
     */
    @PatchMapping("/preferences")
    public BaseResponse<Void> updatePreferences(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody UserPreferenceUpdateRequest request) {

        UUID userId = getUserId(user);

        userService.updateUserPreferences(userId, request.getCategoryIds());

        return BaseResponse.success();
    }

    /**
     * 사용자가 설정한 선호 카테고리 목록을 조회
     *
     * @param user 인증된 사용자 정보
     * @return 선호 카테고리 목록 응답 객체
     */
    @GetMapping("/preferences")
    public BaseResponse<UserPreferenceResponse> getPreferences(
            @AuthenticationPrincipal UserDetails user) {

        UUID userId = getUserId(user);

        UserPreferenceResponse response = userService.getUserPreferences(userId);

        return BaseResponse.success(response);
    }

    /**
     * 타인 프로필 조회
     *
     * @param user 인증된 사용자 정보
     * @param otherId 조회할 사용자 UUID
     * @return 타인 프로필 정보를 담은 응답 객체
     */
    @GetMapping("/{otherId}/profile")
    public BaseResponse<OtherProfileResponse> getOtherProfile(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID otherId) {

        UUID userId = getUserId(user);

        OtherProfileResponse response = userService.getOtherProfile(userId, otherId);

        return BaseResponse.success(response);
    }

    /**
     * 독서 시간 기록
     */
    @PostMapping("/reading-time")
    public BaseResponse<Void> recordReadingTime(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam Long readingTime) {

        UUID userId = getUserId(user);

        userService.updateTotalReadingTime(userId, readingTime);

        return BaseResponse.success();
    }
}
