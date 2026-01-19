package com.liverary.backend.review.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 리뷰(Review) 도메인 엔티티 클래스입니다.
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "review")
public class Review {

    // 댓글 넘버
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "review_id")
    private UUID reviewId;

    // 게시글 넘버
    @Column(nullable = false, name = "board_id")
    private UUID boardId;

    // 유저 넘버
    @Column(nullable = false, name = "user_id")
    private UUID userId;

    // 내용
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 생성일자
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    // 수정일자
    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 리뷰 엔티티를 생성하는 빌더 생성자입니다.
     *
     * @param boardId 연관된 게시글 UUID
     * @param userId  작성자 UUID
     * @param content 리뷰 내용
     */
    @Builder
    public Review(UUID boardId, UUID userId, String content) {
        this.boardId = boardId;
        this.userId = userId;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }
}
