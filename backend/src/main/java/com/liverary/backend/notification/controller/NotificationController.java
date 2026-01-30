package com.liverary.backend.notification.controller;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }


    /**
     * Subscribe API: 로그인한 유저가 SSE 연결을 요청하는 엔드포인트
     * @param user
     * @return
     */
    @GetMapping(value = "/api/notification/subscribe",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe (@AuthenticationPrincipal UserDetails user){
        UUID userId = getUserId(user);
        return notificationService.subscribe(userId);
    }


}
