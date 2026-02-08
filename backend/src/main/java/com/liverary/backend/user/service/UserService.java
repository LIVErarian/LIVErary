package com.liverary.backend.user.service;

import com.liverary.backend.bookHistory.domain.BookStatus;
import com.liverary.backend.bookHistory.repository.BookHistoryRepository;
import com.liverary.backend.category.domain.Category;
import com.liverary.backend.category.repository.CategoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.friend.domain.Friend;
import com.liverary.backend.friend.repository.FriendRepository;
import com.liverary.backend.ranking.service.RankingService;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.domain.UserPreference;
import com.liverary.backend.user.dto.request.UserUpdateRequest;
import com.liverary.backend.user.dto.response.BookSummary;
import com.liverary.backend.user.dto.response.OtherProfileResponse;
import com.liverary.backend.user.dto.response.ProfileResponse;
import com.liverary.backend.user.dto.response.UserPreferenceResponse;
import com.liverary.backend.user.repository.UserPreferenceRepository;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 회원 정보 및 활동 내역 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

        private final UserRepository userRepository;
        private final UserPreferenceRepository userPreferenceRepository;
        private final BookHistoryRepository bookHistoryRepository;
        private final CategoryRepository categoryRepository;
        private final FriendRepository friendRepository;
        private final RankingService rankingService;

        /**
         * 사용자의 프로필 정보와 상태별 도서 활동 내역 조회
         *
         * @param userId 사용자 UUID
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
                List<String> preferences = userPreferenceRepository.findByUser(user).stream()
                                .map(preference -> preference.getCategory().getName())
                                .toList();

                return ProfileResponse.of(user, wishCount, readingCount, completedCount, preferences);
        }

        /**
         * 사용자가 요청한 특정 상태의 도서 목록만 페이징하여 조회
         *
         * @param userId   사용자 UUID
         * @param status   특정 상태 (WISH, READING, COMPLETED)
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
         * @param userId  사용자 UUID
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
         * @param userId  사용자 UUID
         * @param minutes RoomService로 부터 받아온 유저가 책 읽은 시간
         */
        @Transactional
        public void updateTotalReadingTime(UUID userId, Long minutes) {

                // 유저 정보 조회
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

                // TotalReadingTime 업데이트
                user.updateTotalReadingTime(minutes);

                // Redis 랭킹 추가
                rankingService.updateRanking(userId, minutes);
        }

        /**
         * 사용자의 선호 카테고리를 최초 등록합니다.
         *
         * @param userId      사용자 UUID
         * @param categoryIds 등록할 카테고리 ID 목록
         */
        @Transactional
        public void createUserPreferences(UUID userId, List<UUID> categoryIds) {

                // 유저 정보 조회
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

                // 해당 유저의 선호 정보가 이미 존재하는지 조회
                List<UserPreference> existing = userPreferenceRepository.findByUser(user);

                // 이미 등록된 정보가 있다면 새로 생성하지 않고 업데이트 로직 호출
                if (!existing.isEmpty()) {
                        updateUserPreferences(userId, categoryIds);
                        return;
                }

                savePreferences(user, categoryIds);
        }

        /**
         * 사용자의 선호 카테고리 정보를 수정합니다.
         *
         * @param userId      사용자 UUID
         * @param categoryIds 수정할 카테고리 ID 목록
         */
        @Transactional
        public void updateUserPreferences(UUID userId, List<UUID> categoryIds) {

                // 유저 정보 조회
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

                // 현재 설정된 선호 정보 리스트 조회
                List<UserPreference> currentPreferences = userPreferenceRepository.findByUser(user);
                List<UUID> currentCategoryIds = currentPreferences.stream()
                                .map(p -> p.getCategory().getCategoryId())
                                .toList();

                // 삭제할 항목: 현재 정보에는 있지만 요청에는 없는 ID
                List<UserPreference> toDelete = currentPreferences.stream()
                                .filter(p -> !categoryIds.contains(p.getCategory().getCategoryId()))
                                .toList();

                if (!toDelete.isEmpty()) {
                        userPreferenceRepository.deleteAll(toDelete);
                }

                // 추가할 항목: 요청에는 있지만 현재 정보에는 없는 ID
                List<UUID> toAddIds = categoryIds.stream()
                                .filter(id -> !currentCategoryIds.contains(id))
                                .toList();

                if (!toAddIds.isEmpty()) {
                        savePreferences(user, toAddIds);
                }
        }

        /**
         * 카테고리 정보를 데이터베이스에 저장하는 공통 로직
         * 모든 카테고리 ID가 유효한지 검증한 후 저장 작업 수행
         *
         * @param user        사용자 엔티티
         * @param categoryIds 저장할 카테고리 ID 목록
         * @throws BaseException 카테고리 ID가 유효하지 않을 경우 발생 (CATEGORY_NOT_FOUND)
         */
        private void savePreferences(User user, List<UUID> categoryIds) {
                // 중복 제거하여 실제 확인해야 할 고유 ID 목록
                List<UUID> distinctIds = categoryIds.stream().distinct().toList();

                List<Category> categories = categoryRepository.findAllById(distinctIds);

                // 고유한 요청 ID 개수와 조회된 엔티티 개수가 다르면 잘못된 ID가 포함된 것
                if (categories.size() != distinctIds.size()) {
                        throw new BaseException(ErrorCode.CATEGORY_NOT_FOUND);
                }

                // 새로운 선호 정보 엔티티 생성 및 저장
                List<UserPreference> preferences = categories.stream()
                                .map(category -> UserPreference.builder()
                                                .user(user)
                                                .category(category)
                                                .build())
                                .toList();

                userPreferenceRepository.saveAll(preferences);
        }

        /**
         * 사용자가 설정한 선호 카테고리 목록을 조회합니다.
         *
         * @param userId 사용자 UUID
         * @return 선호 카테고리 정보가 담긴 응답 객체
         */
        @Transactional(readOnly = true)
        public UserPreferenceResponse getUserPreferences(UUID userId) {

                // 유저 정보 조회
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

                // 해당 유저의 모든 선호 카테고리 엔티티 조회
                List<UserPreference> preferences = userPreferenceRepository.findByUser(user);

                return UserPreferenceResponse.from(preferences);
        }

        /**
         * 타인 프로필 정보 조회
         *
         * @param userId  사용자 UUID
         * @param otherId 프로필 조회할 타인 UUID
         * @return 타인 프로필 정보가 담긴 응답 객체
         */
        public OtherProfileResponse getOtherProfile(UUID userId, UUID otherId) {
                // 사용자 조회
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

                // 타인 조회
                User otherUser = userRepository.findById(otherId)
                                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

                // 도서 통계 계산
                long wish = bookHistoryRepository.countByUserAndStatus(otherUser, BookStatus.WISH);
                long reading = bookHistoryRepository.countByUserAndStatus(otherUser, BookStatus.READING);
                long completed = bookHistoryRepository.countByUserAndStatus(otherUser, BookStatus.COMPLETED);

                // 선호 카테고리 조회
                List<String> preferences = userPreferenceRepository.findByUser(otherUser).stream()
                                .map(preference -> preference.getCategory().getName())
                                .toList();

                // 본인 캐릭터를 클릭한 경우
                if (userId.equals(otherId)) {
                        return OtherProfileResponse.of(otherUser, wish, reading, completed, preferences, "MYSELF");
                }

                // 양방향 관계 조회
                Friend relation = friendRepository.findRelation(user, otherUser).orElse(null);

                // 관계 상태 결정
                String status = (relation != null) ? relation.getRelationStatus(userId) : "NONE";

                return OtherProfileResponse.of(otherUser, wish, reading, completed, preferences, status);
        }

}
