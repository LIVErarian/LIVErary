package com.liverary.backend.config;

import com.liverary.backend.auth.provider.JwtProvider;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.repository.UserRepository;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

/**
 * WebSocket 핸드셰이크에서 JWT를 검증하고 Principal을 설정한다.
 */
@RequiredArgsConstructor
public class StompHandshakeHandler extends DefaultHandshakeHandler {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    /**
     * WebSocket 연결 시 Principal을 결정한다.
     *
     * @param request    HTTP 요청
     * @param wsHandler  WebSocket 핸들러
     * @param attributes 핸드셰이크 속성
     * @return 결정된 Principal (없으면 null)
     */
    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {
        // Header에서 JWT 추출
        String jwt = resolveTokenFromHeader(request);
        if (StringUtils.hasText(jwt) && jwtProvider.validateToken(jwt)) {

            // 토큰 subject를 Principal name으로 사용
            String jwtUserId = jwtProvider.parseClaims(jwt).getSubject();

            UUID userId;
            try {
                userId = UUID.fromString(jwtUserId);
            } catch (IllegalArgumentException e) {
                throw new BaseException(ErrorCode.INVALID_UUID_FORMAT);
            }

            if (userRepository.existsById(userId)) {
                return new StompPrincipal(jwtUserId);
            }

            return null;
        }
        return null;
    }

    /**
     * 헤더에서 JWT를 추출한다.
     *
     * @param request HTTP 요청
     * @return JWT 토큰 (없으면 null)
     */
    private String resolveTokenFromHeader(ServerHttpRequest request) {
        String bearer = request.getHeaders().getFirst("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    /**
     * STOMP에서 사용할 Principal 구현체.
     */
    @Getter
    @AllArgsConstructor
    private static class StompPrincipal implements Principal {
        // Principal 이름(사용자 식별자)
        private final String name;
    }
}
