package com.liverary.backend.notification.repository;

import com.liverary.backend.notification.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepository  extends JpaRepository<Notification, UUID> {

}
