package com.liverary.backend.notification.repository;

import com.liverary.backend.notification.domain.Notification;
import com.liverary.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository  extends JpaRepository<Notification, UUID> {

    // 사용자별 알림 목록 조회 (최신순 정렬)
    List<Notification> findAllByUserOrderByCreatedAtDesc(User user);

    // 30일 이상 지난 알림 삭제
    void deleteByCreatedAtBefore(LocalDateTime dateTime);
}
