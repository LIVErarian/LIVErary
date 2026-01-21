package com.liverary.backend.room.repository;

import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomStatus;
import com.liverary.backend.room.domain.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * Room 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface RoomRepository extends JpaRepository<Room, UUID> {
    // 특정 RoomType이면서, Status 목록에 포함된 방들 조회 (페이징 포함)
    Page<Room>findByRoomTypeAndStatusIn(RoomType roomType, List<RoomStatus> statuses, Pageable pageable);

    // RoomType 상관없이 Status 목록에 포함된 방들 조회 (전체 조회용)
    Page<Room> findByStatusIn(List<RoomStatus> statuses, Pageable pageable);

    // Status 목록에 포함된 방들 중 keyword가 제목에 포함되어 있거나 코드와 일치하는 방 검색
    @Query("SELECT r FROM Room r WHERE r.status IN :statuses AND (r.title LIKE %:keyword% OR r.code = :keyword)")
    Page<Room> searchByKeyword(
            @Param("statuses") List<RoomStatus> statuses,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
