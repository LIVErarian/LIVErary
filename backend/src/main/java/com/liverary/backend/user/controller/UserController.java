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

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public BaseResponse<ProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 10) Pageable pageable) {

        UUID userId = UUID.fromString(user.getUsername());

        ProfileResponse response = userService.getProfile(userId, pageable);

        return BaseResponse.success(response);
    }
}
