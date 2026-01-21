package com.liverary.backend.auth.controller;

import com.liverary.backend.auth.dto.request.SignupRequest;
import com.liverary.backend.auth.service.AuthService;
import com.liverary.backend.common.dto.BaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

}
