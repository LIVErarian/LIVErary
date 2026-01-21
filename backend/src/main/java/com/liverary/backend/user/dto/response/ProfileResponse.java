package com.liverary.backend.user.dto.response;

import com.liverary.backend.user.domain.Gender;
import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.UUID;

/**
 * 마이페이지 프로필 조회를 위한 통합 응답 객체
 */
@Getter
@Builder
@AllArgsConstructor
public class ProfileResponse {

    private UUID userId;
    private String email;
    private String nickname;
    private Gender gender;
    private Role role;
    private Long totalReadingTime;

    private Page<BookSummary> wishBooks;        // 찜한 책
    private Page<BookSummary> readingBooks;     // 읽고있는 책
    private Page<BookSummary> completedBooks;   // 다 읽은 책

    /**
     * User 엔티티와 각 상태별 도서 페이지를 기반으로 ProfileResponse 객체 생성
     *
     * @param user      사용자 엔티티 (기본 프로필 정보 제공)
     * @param reading   읽고 있는 도서 목록의 페이징 객체
     * @param wish      찜한 도서 목록의 페이징 객체
     * @param completed 다 읽은 도서 목록의 페이징 객체
     * @return 프로필 정보와 상태별 도서 목록이 통합된 ProfileResponse 객체
     */
    public static ProfileResponse of(User user, Page<BookSummary> reading, Page<BookSummary> wish, Page<BookSummary> completed) {
        return ProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .gender(user.getGender())
                .role(user.getRole())
                .totalReadingTime(user.getTotalReadingTime())
                .wishBooks(wish)
                .readingBooks(reading)
                .completedBooks(completed)
                .build();
    }

}
