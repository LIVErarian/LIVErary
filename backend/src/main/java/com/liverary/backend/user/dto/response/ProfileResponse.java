package com.liverary.backend.user.dto.response;

import com.liverary.backend.user.domain.Gender;
import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.UUID;

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
