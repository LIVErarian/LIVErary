package com.liverary.backend.review.dto.response;

import com.liverary.backend.review.domain.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ReviewResponse {
    private UUID reviewId;
    private String nickname;
    private String content;
    private LocalDateTime createdAt;

    // 엔티티 -> DTO 변환 메서드
    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .nickname(review.getUser().getNickname())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
