package com.liverary.backend.room.repository;

import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomStatus;
import com.liverary.backend.room.domain.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
