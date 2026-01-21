package com.liverary.backend.user.service;

import com.liverary.backend.bookHistory.domain.BookStatus;
import com.liverary.backend.bookHistory.repository.BookHistoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.dto.request.UserUpdateRequest;
import com.liverary.backend.user.dto.response.BookSummary;
import com.liverary.backend.user.dto.response.ProfileResponse;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 회원 정보 및 활동 내역 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final BookHistoryRepository bookHistoryRepository;

    /**
     * 사용자의 프로필 정보와 상태별 도서 활동 내역 조회
     *
     * @param userId   사용자 UUID
     * @param pageable 페이징 정보
     * @return 프로필 정보 및 상태별 도서 목록이 포함된 ProfileResponse
     * @throws BaseException 유저를 찾을 수 없는 경우 발생 (USER_NOT_FOUND)
     */
    public ProfileResponse getProfile(UUID userId, Pageable pageable) {

        // 유저 정보 조회
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

    /**
     * 사용자 정보 수정
     *
     * @param userId      사용자 UUID
     * @param request 수정할 사용자 정보 객체
     */
    @Transactional
    public void updateProfile(UUID userId, UserUpdateRequest request) {

        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 2. 닉네임 업데이트 (엔티티 내 메서드 호출)
        user.update(request);
    }

}