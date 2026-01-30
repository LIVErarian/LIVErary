package com.liverary.backend.room.scheduler;

import com.liverary.backend.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 *
 */
@Component
@RequiredArgsConstructor
public class RoomScheduler {
    public final RoomService roomService;

    @Scheduled(cron = "0 * * * * *")
    public void runRoomSchedules() {
        // 시작 임박 예약 방을 LIVE로 전환
        roomService.autoStartScheduledRooms();

        // 시작 후 10분 동안 참여자가 없으면 종료
        roomService.autoCloseNoShowRooms();

        // 종료 시간이 지난 방 종료 및 유저 퇴장
        roomService.autoCloseFinishedRooms();
    }
}
