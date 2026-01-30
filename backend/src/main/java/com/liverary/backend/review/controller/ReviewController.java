package com.liverary.backend.review.controller;

import com.liverary.backend.board.dto.request.BoardUpdateRequest;
import com.liverary.backend.board.dto.response.BoardDetailResponse;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.review.dto.request.ReviewCreateRequest;
import com.liverary.backend.review.dto.request.ReviewUpdateRequest;
import com.liverary.backend.review.dto.response.ReviewResponse;
import com.liverary.backend.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 댓글(Review) API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {

    private final ReviewService reviewService;

    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

    /**
     * 댓글 작성 API
     *
     * @param user    인증된 사용자 정보 (작성자)
     * @param boardId 댓글을 작성할 게시글의 UUID
     * @param dto     댓글 내용이 담긴 요청 객체
     * @return 생성된 댓글 정보가 포함된 응답 객체
     */
    @PostMapping("/{boardId}/reviews")
    public BaseResponse<ReviewResponse> createReview(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID boardId,
            @RequestBody @Valid ReviewCreateRequest dto){

        UUID userId = getUserId(user);
        ReviewResponse response = reviewService.createReview(userId, boardId, dto);
        return BaseResponse.success(response);
    }

    /**
     * 특정 게시글의 댓글 목록 조회
     *
     * @param boardId 조회할 게시글의 UUID
     * @return 해당 게시글에 달린 댓글 목록 리스트
     */
    @GetMapping("/{boardId}")
    public BaseResponse<Page<ReviewResponse>> getReviews(@PathVariable UUID boardId, @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
                                                         Pageable pageable){
        Page<ReviewResponse> response = reviewService.getReviewList(boardId, pageable);

        return BaseResponse.success(response);
    }

    /**
     * 댓글 수정
     *
     * @param user     수정을 요청한 인증된 사용자 (작성자 본인)
     * @param reviewId 수정할 댓글의 UUID
     * @param dto      수정할 내용이 담긴 요청 객체
     * @return 수정된 댓글 정보가 포함된 응답 객체
     */
    @PatchMapping("/{reviewId}")
    public BaseResponse<ReviewResponse> updateReview(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID reviewId,
            @RequestBody @Valid ReviewUpdateRequest dto
    ){
        UUID userId = getUserId(user);
        ReviewResponse response = reviewService.updateReview(userId, reviewId, dto);
        return BaseResponse.success(response);
    }

    /**
     * 댓글 삭제
     *
     * @param user     삭제를 요청한 인증된 사용자 (작성자 본인)
     * @param reviewId 삭제할 댓글의 UUID
     * @return 삭제 성공 메시지가 포함된 응답 객체
     */
    @DeleteMapping("/{reviewId}")
    public BaseResponse<String> deleteReview(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID reviewId) {
        UUID userId = getUserId(user);
        reviewService.deleteReview(userId, reviewId);
        return BaseResponse.success();
    }


}
