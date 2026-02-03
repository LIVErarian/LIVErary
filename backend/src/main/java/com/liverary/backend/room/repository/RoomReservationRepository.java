package com.liverary.backend.room.repository;

import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomReservation;
import com.liverary.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * RoomReservation 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface RoomReservationRepository extends JpaRepository<RoomReservation, UUID> {
    // 특정 방의 현재 예약 인원 조회
    long countByRoom(Room room);

    // 유저가 특정 방에 이미 예약했는지 확인
    boolean existsByRoomAndUser(Room room, User user);

    // 유저와 방 정보를 기준으로 예약 내역 조회
    Optional<RoomReservation> findByRoomAndUser(Room room, User user);

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

    // 특정 방의 모든 예약 내역 삭제
    void deleteAllByRoom(Room room);

    // 내 예약 목록 조회
    @Query("SELECT rr FROM RoomReservation rr JOIN FETCH rr.room r WHERE r.endAt > CURRENT_TIMESTAMP AND rr.user = :user ORDER BY r.startAt DESC")
    List<RoomReservation> findAllByUser(@Param("user") User user);

    // 예약 리마인더 알림용: 시작 시간이 특정 시간 범위 내에 있는 예약 조회
    @Query("SELECT rr FROM RoomReservation rr " +
            "JOIN FETCH rr.user " +
            "JOIN FETCH rr.room r " +
            "WHERE r.startAt BETWEEN :start AND :end")
    List<RoomReservation> findReservationsStartingBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 예약 리마인더 알림용: 종료 시간이 특정 시간 범위 내에 있는 예약 조회
    @Query("SELECT rr FROM RoomReservation rr " +
            "JOIN FETCH rr.user " +
            "JOIN FETCH rr.room r " +
            "WHERE r.endAt BETWEEN :start AND :end")
    List<RoomReservation> findReservationsByEndingBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}

