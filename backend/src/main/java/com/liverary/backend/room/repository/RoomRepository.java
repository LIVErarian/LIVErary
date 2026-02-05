package com.liverary.backend.room.repository;

import com.liverary.backend.category.domain.Category;
import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomStatus;
import com.liverary.backend.room.domain.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Room 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface RoomRepository extends JpaRepository<Room, UUID> {
    /**
     * 통합 검색 쿼리
     * - Status (LIVE/SCHEDULED)
     * - RoomType (TALK 고정)
     * - Category (Nullable)
     * - AccessType (Nullable)
     * - Keyword (Nullable)
     */
    @Query("SELECT r FROM Room r " +
            "WHERE r.status = :status " +
            "AND r.roomType = :roomType " +
            "AND (:categoryId IS NULL OR r.category.categoryId = :categoryId) " +
            "AND (:accessType IS NULL OR r.accessType = :accessType) " +
            "AND (:keyword IS NULL OR r.title LIKE %:keyword%)")
    Page<Room> findRoomsWithFilters(
            @Param("status") RoomStatus status,
            @Param("roomType") RoomType roomType,
            @Param("categoryId") UUID categoryId,
            @Param("accessType") AccessType accessType,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    // Status 목록에 포함된 방들 중 keyword가 제목에 포함되어 있는 방 검색
    Page<Room> findByStatusInAndTitleContaining(Collection<RoomStatus> statuses, String keyword, Pageable pageable);

    // 초대 코드(Code)로 정확히 일치하는 방 검색 (단건)
    Optional<Room> findByCodeAndStatusIn(String code, Collection<RoomStatus> statuses);

    // [자동 시작 대상] 시작 시간까지 10분 이하로 남은 예약 방 조회
    List<Room> findAllByStatusAndStartAtLessThanEqual(RoomStatus status, LocalDateTime time);

    // [노쇼 종료 대상] LIVE 상태 + 시작 후 10분 경과 + 인원 0명 + (STABLE 타입 제외)
    List<Room> findAllByStatusAndStartAtLessThanEqualAndCurrentCountAndRoomTypeNot(
            RoomStatus status,
            LocalDateTime time,
            int currentCount,
            RoomType roomType
    );

    // [자동 종료 대상] LIVE 상태 + 종료 시간 경과 + (STABLE 타입 제외)
    List<Room> findAllByStatusAndEndAtLessThanEqualAndRoomTypeNot(
            RoomStatus status,
            LocalDateTime time,
            RoomType roomType
    );

    // 카테고리별 LIVE 방을 최신 시작 시간순으로 조회 (추천용)
    List<Room> findAllByCategoryAndStatusOrderByStartAtDesc(
            Category category,
            RoomStatus status,
            Pageable pageable
    );

    // LIVE 방 전체를 최신 시작 시간순으로 조회 (추천용)
    List<Room> findAllByStatusOrderByStartAtDesc(RoomStatus roomStatus, Pageable pageable);
}
