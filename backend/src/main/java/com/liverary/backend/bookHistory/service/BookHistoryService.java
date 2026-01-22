package com.liverary.backend.bookHistory.service;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.repository.BookRepository;
import com.liverary.backend.bookHistory.DTO.response.WishStatusResponse;
import com.liverary.backend.bookHistory.domain.BookHistory;
import com.liverary.backend.bookHistory.domain.BookStatus;
import com.liverary.backend.bookHistory.repository.BookHistoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BookHistoryService {

    private final BookHistoryRepository bookHistoryRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    /**
     * 찜하기 토글 (찜 추가 / 삭제)
     * @param bookId 책 ID
     * @param userId 유저 ID
     * @return WishSTatusResponse
     */
    @Transactional
    public WishStatusResponse toggleWish(UUID bookId, UUID userId) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 도서 조회
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BaseException(ErrorCode.BOOK_NOT_FOUND));

        // 찜 상태의 BookHistory 확인
        return bookHistoryRepository.findByUser_UserIdAndBook_BookIdAndStatus(userId, bookId, BookStatus.WISH)
                .map(bookHistory -> {
                    // 이미 찜한 경우 -> 삭제
                    bookHistoryRepository.delete(bookHistory);
                    return WishStatusResponse.of(false);
                })
                .orElseGet(() -> {
                    // 찜하지 않은 경우 -> 추가
                    BookHistory newWish = BookHistory.builder()
                            .user(user)
                            .book(book)
                            .status(BookStatus.WISH)
                            .startDate(null)
                            .endDate(null)
                            .build();
                    bookHistoryRepository.save(newWish);
                    return WishStatusResponse.of(true);
                });
    }


    /**
     * 특정 책의 찜 상태 확인
     * @param bookId 책 ID
     * @param userId 유저 ID
     * @return WishStatusResponse
     */
    public WishStatusResponse getWishStatus(UUID bookId, UUID userId){

        boolean isWished = bookHistoryRepository.existsByUser_UserIdAndBook_BookIdAndStatus(userId,bookId,BookStatus.WISH);

        return WishStatusResponse.of(isWished);
    }
}
