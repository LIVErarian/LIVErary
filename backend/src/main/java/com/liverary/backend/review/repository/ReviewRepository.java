package com.liverary.backend.review.repository;

import com.liverary.backend.review.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

/**
 * 리뷰 데이터 접근 계층(Repository) 인터페이스입니다.
 */
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    // 특정 게시글에 달린 모든 댓글 조회
    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.board.boardId = :boardId ORDER BY r.createdAt ASC")
    Page<Review> findAllByBoard(@Param("boardId") UUID boardId, Pageable pageable);

    // 특정 게시글에 달린 모든 댓글 삭제
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Review r WHERE r.board.boardId = :boardId")
    void deleteReviewsByBoardId(@Param("boardId") UUID boardId);
}
