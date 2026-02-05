package com.liverary.backend.review.service;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Status;
import com.liverary.backend.board.domain.Type;
import com.liverary.backend.board.repository.BoardRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.notification.domain.NotificationType;
import com.liverary.backend.notification.service.NotificationService;
import com.liverary.backend.review.domain.Review;
import com.liverary.backend.review.dto.request.ReviewCreateRequest;
import com.liverary.backend.review.dto.request.ReviewUpdateRequest;
import com.liverary.backend.review.dto.response.ReviewResponse;
import com.liverary.backend.review.repository.ReviewRepository;
import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 댓글 비즈니스 로직 처리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    private final NotificationService notificationService;

    /**
     * 댓글 생성 로직 수행
     *
     * @param userId  댓글을 작성하는 사용자의 고유 ID
     * @param boardId 댓글이 달릴 게시글의 ID
     * @param request 댓글 생성 요청 DTO
     * @return 생성된 댓글 정보 응답 DTO
     */
    @Transactional
    public ReviewResponse createReview(UUID userId, UUID boardId, ReviewCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BaseException(ErrorCode.BOARD_NOT_FOUND));

        // 공지 게시판 댓글 작성 불가
        if (board.getType() == Type.NOTICE) {
            throw new BaseException(ErrorCode.REVIEW_NOT_ALLOWED);
        }

        // 문의 게시판 관리자 권한 확인 및 상태 변경 (PENDING -> DONE)
        board.validateAndCompleteInquiry(user);

        Review review = Review.builder()
                .user(user)
                .board(board)
                .content(request.getContent())
                .build();

        Review savedReview = reviewRepository.save(review);

        return ReviewResponse.from(savedReview);
    }

    /**
     * 특정 게시글의 댓글 목록 조회
     *
     * @param boardId 게시글 ID
     * @return 댓글 목록 응답 DTO 리스트
     */
    public Page<ReviewResponse> getReviewList(UUID boardId, Pageable pageable) {
        // 게시글 존재 여부 확인
        if (!boardRepository.existsById(boardId)) {
            throw new BaseException(ErrorCode.BOARD_NOT_FOUND);
        }

        Page<Review> reviewPage = reviewRepository.findAllByBoard(boardId, pageable);

        return reviewPage.map(ReviewResponse::from);

    }

    /**
     * 댓글 수정
     *
     * @param userId   수정을 요청한 사용자 ID
     * @param reviewId 수정할 댓글 ID
     * @param request  수정할 내용 DTO
     * @return 수정된 댓글 정보 응답 DTO
     */
    @Transactional
    public ReviewResponse updateReview(UUID userId, UUID reviewId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BaseException(ErrorCode.REVIEW_NOT_FOUND)); // ErrorCode 추가 필요

        // 작성자 본인 확인
        validateOwner(userId, review);

        review.update(request.getContent());

        return ReviewResponse.from(review);
    }

    /**
     * 댓글 삭제
     *
     * @param userId   삭제를 요청한 사용자 ID
     * @param reviewId 삭제할 댓글 ID
     */
    @Transactional
    public void deleteReview(UUID userId, UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BaseException(ErrorCode.REVIEW_NOT_FOUND));

        // 작성자 본인 확인
        validateOwner(userId, review);

        reviewRepository.delete(review);
    }

    /**
     * 댓글 작성자와 요청자가 일치하는지 검증
     *
     * @param userId 요청한 사용자의 ID
     * @param review 대상 댓글 엔티티
     */
    private void validateOwner(UUID userId, Review review) {
        if (!review.getUser().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.NOT_REVIEW_OWNER); // ErrorCode 추가 필요
        }
    }

}
