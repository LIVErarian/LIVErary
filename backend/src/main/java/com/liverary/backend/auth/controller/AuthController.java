package com.liverary.backend.auth.controller;

import com.liverary.backend.auth.dto.request.*;
import com.liverary.backend.auth.dto.response.LoginResponse;
import com.liverary.backend.auth.dto.response.RefreshResponse;
import com.liverary.backend.auth.service.AuthService;
import com.liverary.backend.common.dto.BaseResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
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
@RequestMapping("/api/auth")
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
    @SecurityRequirements
    public BaseResponse<Void> checkEmail(@PathVariable String email) {
        authService.checkEmailDuplication(email);
        return BaseResponse.success();
    }

    /**
     * 이메일 인증 코드 발송 요청
     *
     * @param request 인증 코드를 발송할 이메일 정보가 담긴 DTO
     * @return 성공 응답 객체
     */
    @PostMapping("/email/verification/request")
    @SecurityRequirements
    public BaseResponse<Void> requestVerification(@Valid @RequestBody EmailVerificationRequest request) {
        authService.sendVerificationCode(request.getEmail());
        return BaseResponse.success();
    }

    /**
     * 이메일 인증 코드 확인
     *
     * @param request 이메일과 사용자가 입력한 인증 코드가 담긴 DTO
     * @return 성공 응답 객체
     */
    @PostMapping("/email/verification/confirm")
    @SecurityRequirements
    public BaseResponse<Void> confirmVerification(@Valid @RequestBody EmailVerificationRequest request) {
        authService.confirmVerificationCode(request.getEmail(), request.getCode());
        return BaseResponse.success();
    }

    /**
     * 회원가입을 처리
     *
     * @param request 회원가입에 필요한 사용자 정보 DTO
     * @return 회원가입 성공 시 성공 응답 객체
     */
    @PostMapping("/signup")
    @SecurityRequirements
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
    @SecurityRequirements
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
    @SecurityRequirements
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

    /**
     * 비밀번호 찾기
     * 이메일로 임시 비밀번호 전송
     *
     * @param request
     * @return 성공 응답 객체
     */
    @PostMapping("/password/find")
    public BaseResponse<Void> findPassword(@Valid @RequestBody FindPasswordRequest request) {
        authService.findPassword(request.getEmail());
        return BaseResponse.success();
    }

    /**
     * 비밀번호 재설정
     * 로그인한 사용자가 본인의 비밀번호를 변경
     *
     * @param user 현재 인증된 사용자의 정보
     * @return 성공 응답 객체
     */
    @PatchMapping("/password/reset")
    public BaseResponse<Void> resetPassword(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ResetPasswordRequest request) {

        UUID userId = UUID.fromString(user.getUsername());

        authService.resetPassword(userId, request);
        return BaseResponse.success();
    }

}
