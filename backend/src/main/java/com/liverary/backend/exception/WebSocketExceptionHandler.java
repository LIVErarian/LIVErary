package com.liverary.backend.exception;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.security.Principal;
import java.time.Instant;

/**
 * WebSocket(STOMP) 메시지 처리 중 발생한 예외를 사용자에게 전달하는 핸들러.
 */
@ControllerAdvice
public class WebSocketExceptionHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketExceptionHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * WebSocket 오류 정보를 담는 페이로드.
     */
    record WsErrorPayload(
            String code,
            String message,
            Instant timestamp
    ) {}

    /**
     * STOMP 메시지 처리 중 발생한 비즈니스 예외를 사용자에게 전달한다.
     *
     * @param e         발생한 예외
     * @param principal 현재 사용자 Principal
     */
    @MessageExceptionHandler(BaseException.class)
    public void handleBaseException(BaseException e, Principal principal) {
        if (principal == null) {
            return;
        }

        ErrorCode errorCode = e.getErrorCode();

        // 클라이언트로 전달할 오류 페이로드 생성
        WsErrorPayload payload = new WsErrorPayload(
                errorCode.getCode(),
                errorCode.getMessage(),
                Instant.now()
        );

        // 특정 사용자에게만 오류를 전송
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                payload
        );
    }

    /**
     * STOMP 메시지 처리 중 발생한 예측하지 못한 예외를 사용자에게 전달한다.
     *
     * @param e         발생한 예외
     * @param principal 현재 사용자 Principal
     */
    @MessageExceptionHandler(Exception.class)
    public void handleException(Exception e, Principal principal) {
        if (principal == null) {
            return;
        }

        WsErrorPayload payload = new WsErrorPayload(
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                ErrorCode.INTERNAL_SERVER_ERROR.getMessage(),
                Instant.now()
        );

        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                payload
        );
    }
}
