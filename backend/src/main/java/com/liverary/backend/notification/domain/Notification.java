package com.liverary.backend.notification.domain;

import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "NOTIFICATION")
public class Notification {
    @Id
    @Column(name = "notification_id")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID notificationId;

    // 수신자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 알림 유형
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // 알림 내용
    @Column(nullable = false)
    private String content;

    // 알림 읽음 여부 (기본값: false)
    @Column(nullable = false)
    private boolean isRead;

    // 생성일시
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Notification(User user, NotificationType type, String content, boolean isRead){
        this.user = user;
        this.type = type;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = LocalDateTime.now();

    }

    // 알림 읽음 처리 메서드
    public void read() {
        this.isRead = true;
    }
}
