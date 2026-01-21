package com.liverary.backend.bookHistory.domain;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * BookHistory 도메인 엔티티 클래스
 * - 유저의 독서 기록 (찜, 읽는 중, 완독) 상태를 관리함
 */
@Entity
@Table(name="BOOK_HISTORY")
@Getter
@NoArgsConstructor
public class BookHistory {

    @Id
    @Column(name="log_id")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(name = "book_status", nullable = false)
    private BookStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public BookHistory(User user, Book book, BookStatus status, LocalDate startDate, LocalDate endDate){
        this.user = user;
        this.book = book;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }



}
