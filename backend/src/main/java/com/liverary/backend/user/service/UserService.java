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
     * @return 프로필 정보 및 상태별 도서 목록이 포함된 ProfileResponse
     * @throws BaseException 유저를 찾을 수 없는 경우 발생 (USER_NOT_FOUND)
     */
    public ProfileResponse getProfile(UUID userId) {

        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 상태별 도서 개수 조회
        long wishCount = bookHistoryRepository.countByUserAndStatus(user, BookStatus.WISH);
        long readingCount = bookHistoryRepository.countByUserAndStatus(user, BookStatus.READING);
        long completedCount = bookHistoryRepository.countByUserAndStatus(user, BookStatus.COMPLETED);

        return ProfileResponse.of(user, wishCount, readingCount, completedCount);
    }

    /**
     * 사용자가 요청한 특정 상태의 도서 목록만 페이징하여 조회
     *
     * @param userId 사용자 UUID
     * @param status 특정 상태 (WISH, READING, COMPLETED)
     * @param pageable 페이징 정보
     */
    public Page<BookSummary> getUserBooksByStatus(UUID userId, BookStatus status, Pageable pageable) {

        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 사용자가 요청한 상태의 도서만 페이징해서 반환
        return bookHistoryRepository.findByUserAndStatus(user, status, pageable)
                .map(history -> BookSummary.of(history.getBook(), status));
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

        // 프로필 업데이트
        user.updateProfile(request);
    }

    /**
     * 사용자 TotalReadingTime 수정
     *
     * @param userId    사용자 UUID
     * @param minutes   RoomService로 부터 받아온 유저가 책 읽은 시간
     */
    @Transactional
    public void updateTotalReadingTime(UUID userId, Long minutes) {

        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // TotalReadingTime 업데이트
        user.updateTotalReadingTime(minutes);
    }

}