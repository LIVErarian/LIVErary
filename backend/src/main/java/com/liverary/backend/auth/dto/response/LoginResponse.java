package com.liverary.backend.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 로그인 성공 시 발급되는 인증 정보 응답 객체
 */
@Getter
@Builder
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;

}