package com.liverary.backend.notification.controller;

import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.notification.dto.response.NotificationResponse;
import com.liverary.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
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
    @GetMapping(value = "/subscribe",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe (@AuthenticationPrincipal UserDetails user){
        UUID userId = getUserId(user);
        return notificationService.subscribe(userId);
    }


    /**
     * 알림 목록 조회 API
     * - GET/api/notification
     * @param user
     * @return 알림 목록 List (최신순)
     */
    @GetMapping
    public BaseResponse<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal UserDetails user){
        UUID userId = getUserId(user);
        List<NotificationResponse> notifications = notificationService.getNotifications(userId);
        return BaseResponse.success(notifications);
    }


    /**
     * 알림 읽음 처리 API
     * - PATCH /api/notification/{notificationId}/read
     * @param notificationId 읽은 처리할 알림 ID
     * @param user
     * @return
     */
    @PatchMapping("/{notificationId}/read")
    public BaseResponse<Void> markAsRead(@PathVariable UUID notificationId, @AuthenticationPrincipal UserDetails user){
        UUID userId = getUserId(user);
        notificationService.markAsRead(notificationId, userId);
        return BaseResponse.success();
    }


}
