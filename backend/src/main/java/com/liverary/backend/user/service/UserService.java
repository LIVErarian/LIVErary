package com.liverary.backend.user.service;

import com.liverary.backend.bookHistory.domain.BookStatus;
import com.liverary.backend.bookHistory.repository.BookHistoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.dto.response.BookSummary;
import com.liverary.backend.user.dto.response.ProfileResponse;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final BookHistoryRepository bookHistoryRepository;

    public ProfileResponse getProfile(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 찜한 책 (WISH)
        Page<BookSummary> wishBooks = bookHistoryRepository
                .findByUser_UserIdAndStatus(userId, BookStatus.WISH, pageable)
                .map(history -> BookSummary.of(history.getBook(), BookStatus.WISH));

        // 읽는 중 (READING)
        Page<BookSummary> readingBooks = bookHistoryRepository
                .findByUser_UserIdAndStatus(userId, BookStatus.READING, pageable)
                .map(history -> BookSummary.of(history.getBook(), BookStatus.READING));

        // 다 읽은 책 (COMPLETED)
        Page<BookSummary> completedBooks = bookHistoryRepository
                .findByUser_UserIdAndStatus(userId, BookStatus.COMPLETED, pageable)
                .map(history -> BookSummary.of(history.getBook(), BookStatus.COMPLETED));

        return ProfileResponse.of(user, readingBooks, wishBooks, completedBooks);
    }
}