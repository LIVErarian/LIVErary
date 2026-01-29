package com.liverary.backend.bookHistory.controller;

import com.liverary.backend.bookHistory.DTO.response.WishStatusResponse;
import com.liverary.backend.bookHistory.service.BookHistoryService;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
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
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

    /**
     * 도서 찜하기 토글 API
     * - POST /api/book-history/wish/toggle/{isbn}
     * @param isbn
     * @param user
     * @return
     */
    @PostMapping("/wish/toggle/{isbn}")
    public BaseResponse<WishStatusResponse> toggleWish(
            @PathVariable String isbn,
            @AuthenticationPrincipal UserDetails user
    ){
        UUID userId = getUserId(user);

        WishStatusResponse response = bookHistoryService.toggleWish(isbn, userId);
        return BaseResponse.success(response);
    }

    /**
     * 특정 도서 찜 상태 확인 API
     * - GET /api/book-history/wish/{bookId}
     * @param isbn
     * @param user
     * @return
     */
    @GetMapping("/wish/{isbn}")
    public BaseResponse<WishStatusResponse> getWishStatus(
            @PathVariable String isbn,
            @AuthenticationPrincipal UserDetails user
    ){
        UUID userId = getUserId(user);

        WishStatusResponse response = bookHistoryService.getWishStatus(isbn, userId);
        return BaseResponse.success(response);
    }

}
