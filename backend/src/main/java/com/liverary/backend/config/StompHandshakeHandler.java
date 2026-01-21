package com.liverary.backend.config;

import com.liverary.backend.auth.provider.JwtProvider;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import io.jsonwebtoken.Claims;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

/**
 * WebSocket 핸드셰이크 과정에서 JWT를 검증하고 사용자 Principal을 설정한다.
 */
@RequiredArgsConstructor
public class StompHandshakeHandler extends DefaultHandshakeHandler {

    // 인증 헤더 키와 토큰 접두사 상수
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtProvider jwtProvider;

    /**
     * 핸드셰이크 요청에서 사용자 Principal을 결정한다.
     *
     * @param request    서버 HTTP 요청
     * @param wsHandler  WebSocket 핸들러
     * @param attributes 핸드셰이크 속성 맵
     * @return 인증된 사용자의 Principal, 실패 시 null
     */
    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {
        // 헤더에서 JWT 추출
        String jwt = resolveToken(request);
        if (StringUtils.hasText(jwt) && jwtProvider.validateToken(jwt)) {
            // 토큰 검증 후 사용자 식별자를 Principal로 사용
            String userId = jwtProvider.parseClaims(jwt).getSubject();
            return new StompPrincipal(userId);
        }

        // 인증 실패 시 Principal을 설정하지 않음
        return null;
    }

    /**
     * Authorization 헤더에서 Bearer 토큰을 추출한다.
     *
     * @param request 서버 HTTP 요청
     * @return JWT 문자열, 없으면 null
     */
    private String resolveToken(ServerHttpRequest request) {
        // Authorization 헤더에서 Bearer 토큰 파싱
        String bearerToken = request.getHeaders().getFirst(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    /**
     * STOMP 세션에 부여할 사용자 Principal 구현체.
     */
    @Getter
    @AllArgsConstructor
    private static class StompPrincipal implements Principal {
        // Principal 이름(사용자 식별자)
        private final String name;
    }
}
