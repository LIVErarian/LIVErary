package com.liverary.backend.notification.scheduler;

import com.liverary.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 알림 데이터 정리 스케줄러
 * - 생성된 지 30일 이상 지난 알림 삭제 (매일 새벽 3시 실행)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanupScheduler {

    private final NotificationRepository notificationRepository;

    @Scheduled(cron="0 0 3 * * *")
    @Transactional
    public void cleanupOldNotifications(){
        log.info("=== 알림 정리 스케줄러 시작 ===");
        LocalDateTime threshold = LocalDateTime.now().minusDays(30);

        log.info("삭제 기준 시각: {} (30일 전)", threshold);

        try {
            // 성능 측정 시작
            long startTime = System.currentTimeMillis();

            notificationRepository.deleteByCreatedAtBefore(threshold);

            // 성능 측정 종료
            long elapsed = System.currentTimeMillis() - startTime;

            log.info("알림 정리 완료 (소요 시간: {}ms)", elapsed);
        }
        catch(Exception e){
            log.error("알림 정리 실패", e);
            throw e;
        }
        log.info("=== 알림 정리 스케줄러 종료 ===");
    }
}
