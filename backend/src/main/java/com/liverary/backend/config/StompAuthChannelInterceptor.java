package com.liverary.backend.config;

import com.liverary.backend.auth.provider.JwtProvider;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.util.StringUtils;

/**
 * STOMP 메시지마다 JWT 유효성을 검증한다.
 */
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        if (command == null || command == StompCommand.CONNECT || command == StompCommand.DISCONNECT) {
            return message;
        }

        String token = resolveToken(accessor);
        if (!StringUtils.hasText(token)) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }

        jwtProvider.validateToken(token);
        return message;
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders == null || authHeaders.isEmpty()) {
            return null;
        }

        String raw = authHeaders.get(0);
        return StringUtils.hasText(raw) && raw.startsWith("Bearer ")
                ? raw.substring(7)
                : null;
    }
}
