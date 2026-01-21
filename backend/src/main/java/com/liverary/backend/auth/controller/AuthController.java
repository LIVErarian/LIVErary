package com.liverary.backend.auth.controller;

import com.liverary.backend.auth.dto.request.LoginRequest;
import com.liverary.backend.auth.dto.request.RefreshRequest;
import com.liverary.backend.auth.dto.request.SignupRequest;
import com.liverary.backend.auth.dto.response.LoginResponse;
import com.liverary.backend.auth.dto.response.RefreshResponse;
import com.liverary.backend.auth.service.AuthService;
import com.liverary.backend.common.dto.BaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 인증 및 회원 관리와 관련된 API를 처리하는 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    /**
     * 사용 가능한 이메일인지 중복 여부를 확인
     * {email:.+} 정규식으로 이메일 주소 마침표(.) 이후 문자열이 잘리는 현상 방지
     *
     * @param email 중복 검사를 요청한 이메일 주소
     * @return 중복되지 않았을 경우 성공 응답 객체
     */
    @GetMapping("/{email:.+}/exists")
    public BaseResponse<Void> checkEmail(@PathVariable String email) {
        authService.checkEmailDuplication(email);
        return BaseResponse.success();
    }

    /**
     * 회원가입을 처리
     *
     * @param request 회원가입에 필요한 사용자 정보 DTO
     * @return 회원가입 성공 시 성공 응답 객체
     */
    @PostMapping("/signup")
    public BaseResponse<Void> signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return BaseResponse.success();
    }

    /**
     * 이메일과 비밀번호를 기반으로 로그인을 처리
     *
     * @param request 로그인 정보 DTO
     * @return 발급된 토큰 정보를 포함한 성공 응답
     */
    @PostMapping("/login")
    public BaseResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return BaseResponse.success(response);
    }

    /**
     * 리프레시 토큰을 이용한 액세스 토큰 재발급
     *
     * @param request 리프레시 토큰을 포함한 재발급 요청 DTO
     * @return 재발급된 액세스 토큰을 포함한 성공 응답
     */
    @PostMapping("/reissue")
    public BaseResponse<RefreshResponse> reissue(@Valid @RequestBody RefreshRequest request) {
        RefreshResponse response = authService.reissue(request.getRefreshToken());
        return BaseResponse.success(response);
    }

    /**
     * 로그아웃 처리
     * 현재 인증된 사용자의 리프레시 토큰 무효화
     *
     * @param user 현재 인증된 사용자의 정보
     * @return 로그아웃 성공시 성공 응답 객체
     */
    @PostMapping("/logout")
    public BaseResponse<String> logout(@AuthenticationPrincipal UserDetails user) {

        UUID userId = UUID.fromString(user.getUsername());

        authService.logout(userId);
        return BaseResponse.success();
    }

}
