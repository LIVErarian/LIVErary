package com.liverary.backend.exception;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;

@Controller
public class WebSocketExceptionHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketExceptionHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    record WsErrorPayload(
            String message,
            String exception,
            Instant timestamp
    ) {}

    /**
     * STOMP 메시지 처리 중 발생한 예외를 사용자 전용 큐로 전달한다.
     *
     * @param e         발생한 예외
     * @param principal 현재 사용자 Principal
     */
    @MessageExceptionHandler(Exception.class)
    public void handleException(Exception e, Principal principal) {
        WsErrorPayload payload = new WsErrorPayload(
                e.getMessage() != null ? e.getMessage() : "Unknown error",
                e.getClass().getSimpleName(),
                Instant.now()
        );

        // 특정 유저에게만 전송
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                payload
        );
    }
}
