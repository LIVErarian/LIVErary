package com.liverary.backend.config;

import com.liverary.backend.auth.provider.JwtProvider;

import java.security.Principal;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * WebSocket 핸드셰이크에서 JWT를 검증하고 Principal을 설정한다.
 */
@RequiredArgsConstructor
public class StompHandshakeHandler extends DefaultHandshakeHandler {

    private final JwtProvider jwtProvider;

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
        // QueryParameter(jwt)에서 JWT 추출
        String jwt = resolveTokenFromQuery(request);
        if (StringUtils.hasText(jwt) && jwtProvider.validateToken(jwt)) {

            // 토큰 subject를 Principal name으로 사용
            String jwtUserId = jwtProvider.parseClaims(jwt).getSubject();
            return new StompPrincipal(jwtUserId);
        }

        // 검증 실패 시 Principal 미설정
        return null;
    }

    /**
     * 쿼리 파라미터에서 JWT를 추출한다.
     *
     * @param request HTTP 요청
     * @return JWT 토큰 (없으면 null)
     */
    private String resolveTokenFromQuery(ServerHttpRequest request) {
        MultiValueMap<String, String> params =
                UriComponentsBuilder.fromUri(request.getURI()).build().getQueryParams();
        String jwt = params.getFirst("jwt");
        return StringUtils.hasText(jwt) ? jwt : null;
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