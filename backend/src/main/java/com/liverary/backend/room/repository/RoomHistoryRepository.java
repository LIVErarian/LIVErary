package com.liverary.backend.room.repository;

import com.liverary.backend.room.domain.HistoryStatus;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomHistory;
import com.liverary.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * RoomHistory 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface RoomHistoryRepository extends JpaRepository<RoomHistory, UUID> {
    // 이미 해당 방에 '참여 중(JOINED)'인 기록이 있는지 확인
    boolean existsByRoomAndUserAndStatus(Room room, User user, HistoryStatus status);
}
