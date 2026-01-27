package com.liverary.backend.exception;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;

/**
 * WebSocket(STOMP) 메시지 처리 중 발생한 예외를 사용자에게 전달하는 핸들러.
 */
@Controller
public class WebSocketExceptionHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketExceptionHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * WebSocket 오류 정보를 담는 페이로드.
     */
    record WsErrorPayload(
            String message,
            String exception,
            Instant timestamp
    ) {}

    /**
     * STOMP 메시지 처리 중 발생한 예외를 사용자에게 전달한다.
     *
     * @param e         발생한 예외
     * @param principal 현재 사용자 Principal
     */
    @MessageExceptionHandler(Exception.class)
    public void handleException(Exception e, Principal principal) {
        // 클라이언트로 전달할 오류 페이로드 생성
        WsErrorPayload payload = new WsErrorPayload(
                e.getMessage() != null ? e.getMessage() : "Unknown error",
                e.getClass().getSimpleName(),
                Instant.now()
        );

        // 특정 사용자에게만 오류를 전송
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                payload
        );
    }
}
