package com.liverary.backend.room.repository;

import com.liverary.backend.room.domain.HistoryStatus;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomHistory;
import com.liverary.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * RoomHistory 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface RoomHistoryRepository extends JpaRepository<RoomHistory, UUID> {
    // 이미 해당 방에 '참여 중(JOINED)'인 기록이 있는지 확인
    boolean existsByRoomAndUserAndStatus(Room room, User user, HistoryStatus status);

    // 특정 방에서 특정 유저의 '참여 중(JOINED)'인 기록 조회
    Optional<RoomHistory> findByRoomAndUserAndStatus(Room room, User user, HistoryStatus status);

    /**
     * 특정 방에 JOINED 상태로 남아있는 모든 유저를 LEFT 상태로 변경하고 퇴장 시간을 기록합니다.
     *
     * @param room          방 정보
     * @param newStatus     변경할 유저의 상태 (LEFT)
     * @param leftAt        퇴장 시간 (현재 시간)
     * @param currentStatus 현재 유저의 상태 (JOINED)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE RoomHistory rh SET rh.status = :newStatus, rh.leftAt = :leftAt " +
            "WHERE rh.room = :room AND rh.status = :currentStatus")
    void exitAllUsersByRoom(
            @Param("room") Room room,
            @Param("newStatus") HistoryStatus newStatus,
            @Param("leftAt") LocalDateTime leftAt,
            @Param("currentStatus") HistoryStatus currentStatus
    );
}
