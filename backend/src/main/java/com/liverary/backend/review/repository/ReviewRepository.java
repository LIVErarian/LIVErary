package com.liverary.backend.review.repository;

import com.liverary.backend.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * 리뷰 데이터 접근 계층(Repository) 인터페이스입니다.
 */
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByBoardId(UUID boardId);
}
