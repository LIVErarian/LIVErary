package com.liverary.backend.room.repository;

import com.liverary.backend.room.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Room 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface RoomRepository extends JpaRepository<Room, UUID> {

}
