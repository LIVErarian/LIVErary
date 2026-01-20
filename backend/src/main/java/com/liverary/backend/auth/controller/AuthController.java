package com.liverary.backend.auth.controller;

import com.liverary.backend.auth.service.AuthService;
import com.liverary.backend.common.dto.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

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

}
