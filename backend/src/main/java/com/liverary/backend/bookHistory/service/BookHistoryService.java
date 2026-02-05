package com.liverary.backend.bookHistory.service;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.service.BookService;
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
    private final BookService bookService;
    private final UserRepository userRepository;

    /**
     * 찜하기 토글 (찜 추가 / 삭제)
     * @param isbn 도서 ISBN
     * @param userId 유저 ID
     * @return WishStatusResponse
     */
    @Transactional
    public WishStatusResponse toggleWish(String isbn, UUID userId) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 도서 조회 (DB에 없을 경우 추가)
        Book book = bookService.getOrSaveBook(isbn);

        // 찜 상태의 BookHistory 확인 (Entity 기반)
        return bookHistoryRepository.findByUserAndBookAndStatus(user, book, BookStatus.WISH)
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
                            .build();
                    bookHistoryRepository.save(newWish);
                    return WishStatusResponse.of(true);
                });
    }


    /**
     * 특정 책의 찜 상태 확인
     * @param bookId 도서 UUID
     * @param userId 유저 ID
     * @return WishStatusResponse
     */
    public WishStatusResponse getWishStatus(UUID bookId, UUID userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));


        return bookService.findByBookId(bookId)
                .map(book -> {
                    boolean isWished = bookHistoryRepository.existsByUserAndBookAndStatus(user, book, BookStatus.WISH);
                    return WishStatusResponse.of(isWished);
                })
                .orElseGet(() -> WishStatusResponse.of(false));
    }
    /**
     * 읽고 있는 책 등록
     * @param isbn 도서 ISBN
     * @param userId 유저 ID
     */
    @Transactional
    public void registerReading(String isbn, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Book book = bookService.getOrSaveBook(isbn);

        // 이미 읽고 있는 상태인지 확인
        if (bookHistoryRepository.existsByUserAndBookAndStatus(user, book, BookStatus.READING)) {
            return;
        }

        BookHistory history = BookHistory.builder()
                .user(user)
                .book(book)
                .status(BookStatus.READING)
                .build();
        
        bookHistoryRepository.save(history);
    }

    /**
     * 다 읽은 책 등록
     * @param isbn 도서 ISBN
     * @param userId 유저 ID
     */
    @Transactional
    public void registerCompleted(String isbn, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Book book = bookService.getOrSaveBook(isbn);

        // 이미 다 읽은 상태인지 확인
        if (bookHistoryRepository.existsByUserAndBookAndStatus(user, book, BookStatus.COMPLETED)) {
            return;
        }

        BookHistory history = BookHistory.builder()
                .user(user)
                .book(book)
                .status(BookStatus.COMPLETED)
                .build();

        bookHistoryRepository.save(history);
    }
    /**
     * 책 상태 일괄 업데이트 (WISH, READING, COMPLETED)
     * - 기존 기록이 존재하면 상태 변경
     * - 없으면 새로 생성
     */
    @Transactional
    public void updateBookStatus(String isbn, UUID userId, BookStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Book book = bookService.getOrSaveBook(isbn);

        bookHistoryRepository.findByUserAndBook(user, book)
                .ifPresentOrElse(
                        history -> history.updateStatus(status),
                        () -> {
                            BookHistory newHistory = BookHistory.builder()
                                    .user(user)
                                    .book(book)
                                    .status(status)
                                    .build();
                            bookHistoryRepository.save(newHistory);
                        }
                );
    }
}
