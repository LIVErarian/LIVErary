package com.liverary.backend.bookHistory.controller;

import com.liverary.backend.bookHistory.DTO.response.WishStatusResponse;
import com.liverary.backend.bookHistory.service.BookHistoryService;
import com.liverary.backend.common.dto.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/book-history")
@RequiredArgsConstructor
public class BookHistoryController {

    private final BookHistoryService bookHistoryService;

    private UUID getUserId(UserDetails user) {
        return UUID.fromString(user.getUsername());
    }

    /**
     * 도서 찜하기 토글 API
     * - POST /api/book-history/wish/toggle/{bookId}
     * @param bookId
     * @param user
     * @return
     */
    @PostMapping("/wish/toggle/{bookId}")
    public BaseResponse<WishStatusResponse> toggleWish(
            @PathVariable UUID bookId,
            @AuthenticationPrincipal UserDetails user
    ){
        WishStatusResponse response = bookHistoryService.toggleWish(bookId, getUserId(user));
        return BaseResponse.success(response);
    }

    /**
     * 특정 도서 찜 상태 확인 API
     * - GET /api/book-history/wish/{bookId}
     * @param bookId
     * @param user
     * @return
     */
    @GetMapping("/wish/{bookId}")
    public BaseResponse<WishStatusResponse> getWishStatus(
            @PathVariable UUID bookId,
            @AuthenticationPrincipal UserDetails user
    ){
        WishStatusResponse response = bookHistoryService.getWishStatus(bookId, getUserId(user));
        return BaseResponse.success(response);
    }

}
