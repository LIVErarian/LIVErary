package com.liverary.backend.review.domain;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID reviewId;

    // 게시글
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    // 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

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
     * @param board 연관된 게시글
     * @param user  작성자
     * @param content 리뷰 내용
     */
    @Builder
    public Review(Board board, User user, String content) {
        this.board = board;
        this.user = user;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 댓글 정보 수정
     */
    public void update(String content){
        this.content = content;
        this.updatedAt = LocalDateTime.now();
    }
}
