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
     * @param bookId
     * @param user
     * @return
     */
    @GetMapping("/wish/{bookId}")
    public BaseResponse<WishStatusResponse> getWishStatus(
            @PathVariable UUID bookId,
            @AuthenticationPrincipal UserDetails user
    ){
        UUID userId = getUserId(user);

        WishStatusResponse response = bookHistoryService.getWishStatus(bookId, userId);
        return BaseResponse.success(response);
    }

    /**
     * 읽고 있는 책 등록 API
     * - POST /api/book-history/reading/{isbn}
     */
    @PostMapping("/reading/{isbn}")
    public BaseResponse<Void> registerReading(
            @PathVariable String isbn,
            @AuthenticationPrincipal UserDetails user
    ){
        UUID userId = getUserId(user);
        bookHistoryService.registerReading(isbn, userId);
        return BaseResponse.success();
    }

    /**
     * 다 읽은 책 등록 API
     * - POST /api/book-history/completed/{isbn}
     */
    @PostMapping("/completed/{isbn}")
    public BaseResponse<Void> registerCompleted(
            @PathVariable String isbn,
            @AuthenticationPrincipal UserDetails user
    ){
        UUID userId = getUserId(user);
        bookHistoryService.registerCompleted(isbn, userId);
        return BaseResponse.success();
    }

}
