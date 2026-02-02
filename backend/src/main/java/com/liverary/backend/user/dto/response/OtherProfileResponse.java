package com.liverary.backend.user.dto.response;

import com.liverary.backend.friend.domain.FriendStatus;
import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 타인 프로필 조회를 위한 응답 객체
 */
@Getter
@Builder
@AllArgsConstructor
public class OtherProfileResponse {

    private UUID userId;
    private String email;
    private String nickname;
    private Role role;
    private Long totalReadingTime;
    private BookCounts bookCounts;
    private String relationStatus; // 현재 친구/요청/차단 상태

    @Getter
    @AllArgsConstructor
    public static class BookCounts {
        private long wish;
        private long reading;
        private long completed;
    }

    /**
     * 엔티티와 도서 통계, 그리고 관계 상태를 받아 DTO 생성
     */
    public static OtherProfileResponse of(User user, long wish, long reading, long completed, String status) {
        return OtherProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole())
                .totalReadingTime(user.getTotalReadingTime())
                .bookCounts(new BookCounts(wish, reading, completed))
                .relationStatus(status)
                .build();
    }

}