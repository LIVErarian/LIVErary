package com.liverary.backend.notification.dto.response;

import com.liverary.backend.notification.domain.Notification;
import com.liverary.backend.notification.domain.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 알림 조회 API 응답 DTO
 * - GET /api/notification 반환 알림 데이터 형식
 */
@Getter
@Builder
public class NotificationResponse {

    private UUID notificationId;
    private String content;
    private String relatedUrl;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .content(notification.getContent())
                .relatedUrl(notification.getRelatedUrl())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }



}
