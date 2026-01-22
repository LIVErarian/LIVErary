package com.liverary.backend.bookHistory.repository;

import com.liverary.backend.bookHistory.domain.BookHistory;
import com.liverary.backend.bookHistory.domain.BookStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookHistoryRepository extends JpaRepository<BookHistory, UUID> {
    // 사용자의 모든 독서 기록 조회
    Page<BookHistory> findByUser_UserId(UUID userId, Pageable pageable);

    // 사용자의 특정 상태의 독서 기록 조회 (찜한 책 / 읽고 있는 책 / 다 읽은 책)
    Page<BookHistory> findByUser_UserIdAndStatus(UUID userId, BookStatus bookStatus, Pageable pageable);

    // 사용자의 도서 찜 여부 확인
    Optional<BookHistory> findByUser_UserIdAndBook_BookIdAndStatus(UUID userId, UUID bookId, BookStatus status);

    // 찜 존재 여부 확인
    boolean existsByUser_UserIdAndBook_BookIdAndStatus(UUID userId, UUID bookId, BookStatus status);
}