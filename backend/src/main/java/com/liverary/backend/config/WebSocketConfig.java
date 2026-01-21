package com.liverary.backend.config;

import com.liverary.backend.auth.provider.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

/**
 * STOMP 기반 WebSocket 메시징을 위한 엔드포인트와 브로커 설정을 구성한다.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // WebSocket 핸드셰이크에서 JWT 검증에 사용하는 Provider.
    private final JwtProvider jwtProvider;

    /**
     * STOMP 연결을 수락할 엔드포인트를 등록한다.
     *
     * @param registry STOMP 엔드포인트 등록을 위한 레지스트리
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 접속 경로와 CORS 허용 범위를 설정하고, JWT 검증 핸드셰이크 핸들러를 적용한다.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .setHandshakeHandler(new StompHandshakeHandler(jwtProvider));
    }

    /**
     * 메시지 브로커를 구성한다.
     *
     * @param registry 메시지 브로커 설정을 위한 레지스트리
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // 구독용 브로커 경로
        registry.enableSimpleBroker("/topic", "/queue");

        // 목적지 prefix
        registry.setApplicationDestinationPrefixes("/app");
    }
}
