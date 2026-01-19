package com.liverary.backend.room.repository;

import com.liverary.backend.room.domain.RoomHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoomHistoryRepository extends JpaRepository<RoomHistory, UUID> {
}
