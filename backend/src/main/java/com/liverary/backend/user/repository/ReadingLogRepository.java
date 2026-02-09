package com.liverary.backend.user.repository;

import com.liverary.backend.user.domain.ReadingLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReadingLogRepository extends JpaRepository<ReadingLog, UUID> {
}
