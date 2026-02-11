package com.liverary.backend.chat.controller;

import java.security.Principal;
import java.util.UUID;

import com.liverary.backend.chat.dto.request.ChatEnterRequest;
import com.liverary.backend.chat.dto.request.ChatExitRequest;
import com.liverary.backend.chat.dto.request.ChatRequest;
import com.liverary.backend.chat.service.ChatService;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

/**
 * STOMP 채팅 메시지 요청을 처리한다.
 */
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    private UUID getUserId(Principal principal) {
        if (principal == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            throw new BaseException(ErrorCode.INVALID_UUID_FORMAT);
        }
    }

    /**
     * 채팅 입장 요청 처리.
     */
    @MessageMapping("/chat/enter")
    public void enter(@Valid ChatEnterRequest request, Principal principal) {
        UUID userId = getUserId(principal);
        chatService.enter(userId, request);
    }

    /**
     * 채팅 메시지 전송.
     */
    @MessageMapping("/chat/message")
    public void message(@Valid ChatRequest request, Principal principal) {
        UUID userId = getUserId(principal);
        chatService.send(userId, request);
    }

    /**
     * 채팅 퇴장 요청 처리.
     */
    @MessageMapping("/chat/exit")
    public void exit(@Valid ChatExitRequest request, Principal principal) {
        UUID userId = getUserId(principal);
        chatService.exit(userId, request.getFloorId());
    }
}
