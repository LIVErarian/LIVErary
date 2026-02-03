package com.liverary.backend.notification.scheduler;

import com.liverary.backend.notification.domain.NotificationType;
import com.liverary.backend.notification.repository.NotificationRepository;
import com.liverary.backend.notification.service.NotificationService;
import com.liverary.backend.room.domain.RoomReservation;
import com.liverary.backend.room.repository.RoomReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Room 예약 리마인더 알림 스케줄러
 * - 룸 시작 / 종료 10분 전 알림
 * - 1분 마다 자동 실행: 현재 + 9~11분 범위 Room 조회 후 해당 예약자들에게 알림 발송 (알림 중복 방지 - 메모리 캐시)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationNotificationScheduler {

    private final RoomReservationRepository roomReservationRepository;
    private final NotificationRepository notificationRepository;

    /**
     * 중복 알림 방지를 위한 메모리 캐시
     * - Key: "reservationId_START" / "reservationId_END"
     * - Value: 발송 여부
     * 알림 발송 전 캐시 확인 -> 이미 있으면 스킵 -> 없으면 발송 후 캐시 추가
     */
    private final Set<String> sentNotifications = new HashSet<>();
    private final NotificationService notificationService;

    @Scheduled(cron = "0 * * * * *")
    public void sendReservationReminders() {
        long startTime = System.currentTimeMillis();

        LocalDateTime now = LocalDateTime.now();

        log.info("=== 예약 리마인더 스케줄러 시작 (현재: {}) ===", now);

        // 1. 시작 10분 전 알림 발송
        sendStartReminders(now);

        //2. 종료 10분 전 알림 발송
        sendEndReminders(now);

        // 성능 측정 종료
        long elapsedTime = System.currentTimeMillis() - startTime;
        log.info("=== 예약 리마인더 스케줄러 완료 (소요 시간: {}ms) ===", elapsedTime);

        // 성능 모니터링
        if(elapsedTime > 100) {
            log.warn("인덱스 / 최적화 필요");
        }
    }

    /**
     * 예약 시작 10분 전 알림 발송
     * - DB에서 현재 + 9~11분 해당 범위 예약 조회
     * - 중복 체크: sentNotifications
     * - 알림메세지 생성 & 발송 -> 캐시 저장
     * @param now 현재 시각
     */
    private void sendStartReminders(LocalDateTime now){
        LocalDateTime startTime = now.plusMinutes(9);
        LocalDateTime endTime = now.plusMinutes(11);

        log.debug("시작 알림 범위: {} ~ {}", startTime, endTime);

        // DB에서 해당 시간 범위의 예약 조회
        List<RoomReservation> reservations = roomReservationRepository.findReservationsStartingBetween(startTime, endTime);

        if(reservations.isEmpty()) {
            log.debug("시작 알림 대상 없음 ({}~{} 사이)", startTime, endTime);
            return;
        }

        log.info("시작 알림 대상: {}건 ({}~{})",reservations.size(), startTime, endTime);

        // 각 예약에 대해 알림 발성
        int sent = 0;
        for(RoomReservation reservation : reservations) {
            // 중복 방지 - 캐시 키 생성
            String cacheKey = reservation.getReservationId() + "_START";

            // 이미 발송한 알림인지 확인
            if(sentNotifications.contains(cacheKey)) {
                log.debug("중복 알림 스킵: {}", cacheKey);
                continue;
            }

            try{
                String roomCode = reservation.getRoom().getCode();
                String roomTitle = reservation.getRoom().getTitle();

                String message = String.format(
                        "[%s] 예약하신 세션이 10분 후 시작됩니다! 입장코드: %s",
                        roomTitle,
                        roomCode
                );

                // 알림 발송
                notificationService.send(
                        reservation.getUser(),
                        NotificationType.RESERVATION,
                        message,
                        "/rooms/"+reservation.getRoom().getRoomId() // TODO 수정
                );

                // 캐시 저장
                sentNotifications.add(cacheKey);
                sent++;

            }
            catch (Exception e) {
                log.error("시작 알림 발송 실패: reservationId={}", reservation.getReservationId(), e);
            }
        }
        log.info("시작 알림 발송 완료: {}/{}",sent,reservations.size());
    }


    /**
     * 예약 종료 10분 전 알림 발송
     * @param now
     */
    private void sendEndReminders(LocalDateTime now){
        LocalDateTime startTime = now.plusMinutes(9);
        LocalDateTime endTime = now.plusMinutes(11);

        log.debug("종료 알림 범위: {} ~ {}", startTime, endTime);

        // DB에서 해당 시간 범위의 예약 조회
        List<RoomReservation> reservations = roomReservationRepository.findReservationsByEndingBetween(startTime, endTime);

        if(reservations.isEmpty()) {
            log.debug("종료 알림 대상 없음");
            return;
        }

        log.info("종료 알림 대상: {}건 ({}~{} ", reservations.size(), startTime, endTime);

        // 각 예약에 대해 알림 발송
        int sent = 0;
        for(RoomReservation reservation : reservations) {
            String cacheKey = reservation.getReservationId() + "_END";

            if(sentNotifications.contains(cacheKey)) {
                log.debug("중복 알림 스킵");
                continue;
            }

            try{
                String message = String.format("[%s] 예약하신 세션이 10분 후 종료됩니다.",reservation.getRoom().getTitle());

                notificationService.send(
                        reservation.getUser(),
                        NotificationType.RESERVATION,
                        message,
                        "/rooms/"+reservation.getRoom().getRoomId() // TODO 수정
                );

                // 캐시에 저장
                sentNotifications.add(cacheKey);
                sent++;

            }
            catch (Exception e) {
                log.error("종료 알림 발송 실패: reservationId={}", reservation.getReservationId(), e);
            }
        }
        log.info("종료 알림 발송 완료: {}/{}",sent,reservations.size());

    }

}
