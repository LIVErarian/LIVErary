package com.liverary.backend.user.controller;

import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.user.dto.response.ProfileResponse;
import com.liverary.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * 회원 정보 조회 및 관리를 처리하는 API 컨트롤러
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 현재 로그인한 사용자의 마이페이지 정보 조회
     *
     * @param user     인증된 사용자 정보
     * @param pageable 페이징 설정 (기본값: 페이지당 10개 항목)
     * @return 성공 시 ProfileResponse를 담은 BaseResponse
     */
    @GetMapping
    public BaseResponse<ProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 10) Pageable pageable) {

        UUID userId = UUID.fromString(user.getUsername());

        ProfileResponse response = userService.getProfile(userId, pageable);

        return BaseResponse.success(response);
    }
}
