package com.liverary.backend.user.dto.response;

import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
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
    private Role role;
    private Long totalReadingTime;
    private List<String> preferences;
    private BookCounts bookCounts;

    @Getter
    @AllArgsConstructor
    public static class BookCounts {
        private long wish;
        private long reading;
        private long completed;
    }

    /**
     * User 엔티티와 각 상태별 도서 페이지를 기반으로 ProfileResponse 객체 생성
     *
     * @param user      사용자 엔티티 (기본 프로필 정보 제공)
     * @param reading   읽고 있는 도서 목록의 수
     * @param wish      찜한 도서 목록의 수
     * @param completed 다 읽은 도서의 수
     * @return 프로필 정보와 상태별 도서 목록이 통합된 ProfileResponse 객체
     */
    public static ProfileResponse of(User user, long wish, long reading, long completed, List<String> preferences) {
        return ProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole())
                .totalReadingTime(user.getTotalReadingTime())
                .preferences(preferences)
                .bookCounts(new BookCounts(wish, reading, completed))
                .build();
    }

}
