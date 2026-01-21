package com.liverary.backend.bookHistory.repository;

import com.liverary.backend.bookHistory.domain.BookHistory;
import com.liverary.backend.bookHistory.domain.BookStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookHistoryRepository extends JpaRepository<BookHistory, UUID> {
    // 사용자의 모든 독서 기록 조회
    List<BookHistory> findByUser_UserId(UUID userId);

    // 사용자의 특정 상태의 독서 기록 조회 (찜한 책 / 읽고 있는 책 / 다 읽은 책)
    List<BookHistory> findByUser_UserIdAndStatus(UUID userId, BookStatus bookStatus);

}
