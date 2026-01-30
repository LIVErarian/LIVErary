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
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // 수신자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User receiver;

    // 알림 유형
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // 알림 내용
    @Column(nullable = false)
    private String content;

    // 클라이언트 알림 클릭 시 이동할 URL
    private String relatedUrl;

    // 읽음 여부 (기본값: false)
    @Column(nullable = false)
    private boolean isRead;

    // 생성일시
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Notification(User receiver, NotificationType type, String content, String relatedUrl, boolean isRead){
        this.receiver = receiver;
        this.type = type;
        this.content = content;
        this.relatedUrl = relatedUrl;
        this.isRead = isRead;

    }

    // 알림 읽음 처리 메서드
    public void read() {
        this.isRead = true;
    }
}
