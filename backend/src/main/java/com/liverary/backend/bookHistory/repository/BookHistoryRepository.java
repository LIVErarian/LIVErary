package com.liverary.backend.bookHistory.repository;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.bookHistory.domain.BookHistory;
import com.liverary.backend.bookHistory.domain.BookStatus;
import com.liverary.backend.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookHistoryRepository extends JpaRepository<BookHistory, UUID> {

    // 사용자의 특정 상태의 독서 기록 조회 (찜한 책 / 읽고 있는 책 / 다 읽은 책)
    Page<BookHistory> findByUserAndStatus(User user, BookStatus bookStatus, Pageable pageable);

    // 찜 내역 조회 (Entity 기반)
    Optional<BookHistory> findByUserAndBookAndStatus(User user, Book book, BookStatus status);

    // 찜 여부 확인 (Entity 기반)
    boolean existsByUserAndBookAndStatus(User user, Book book, BookStatus status);

    // 사용자의 특정 상태의 독서 기록 수
    long countByUserAndStatus(User user, BookStatus bookStatus);
}