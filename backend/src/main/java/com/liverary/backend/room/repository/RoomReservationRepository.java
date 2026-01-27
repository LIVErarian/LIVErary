package com.liverary.backend.room.repository;

import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomReservation;
import com.liverary.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * RoomReservation 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface RoomReservationRepository extends JpaRepository<RoomReservation, UUID> {
    // 특정 방의 현재 예약 인원 조회
    long countByRoom(Room room);

    // 해당 유저가 '특정 시간대'에 겹치는 예약이 있는지 확인
    // (기존방.시작 < 타겟.종료) AND (기존방.종료 > 타겟.시작) 이면 겹침
    @Query("SELECT COUNT(r) > 0 " +
            "FROM RoomReservation r " +
            "JOIN r.room m " +
            "WHERE r.user = :user " +
            "AND m.startAt < :targetEnd " +
            "AND m.endAt > :targetStart")
    boolean existsOverlappingReservation(@Param("user") User user,
                                         @Param("targetStart") LocalDateTime targetStart,
                                         @Param("targetEnd") LocalDateTime targetEnd);

    // 특정 방을 제외한 해당 유저의 동시간대 중복 예약 존재 여부 확인
    @Query("SELECT COUNT(rr) > 0 " +
            "FROM RoomReservation rr " +
            "JOIN rr.room r " +
            "WHERE rr.user = :user " +
            "AND r.roomId != :excludeRoomId " +
            "AND r.startAt < :end " +
            "AND r.endAt > :start")
    boolean existsOverlappingReservationExcludingRoom(@Param("user") User user,
                                                      @Param("start") LocalDateTime targetStart,
                                                      @Param("end") LocalDateTime targetEnd,
                                                      @Param("excludeRoomId") UUID excludeRoomId);
}
