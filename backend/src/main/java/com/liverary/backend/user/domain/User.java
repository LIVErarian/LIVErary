package com.liverary.backend.user.domain;

import com.liverary.backend.user.dto.request.UserUpdateRequest;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User 도메인 엔티티 클래스입니다.
 */
@Entity
@Getter
@Table(name = "USER")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    // 사용자의 고유 식별자 (UUID)
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID userId;

    // 사용자 닉네임
    @Column(nullable = false)
    private String nickname;

    // 사용자 이메일, 로그인시 아이디로 사용
    @Column(nullable = false, unique = true)
    private String email;

    // 사용자 비밀번호
    @Column(nullable = false)
    private String password;

    // 사용자 성별
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    // 사용자 권한
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // 누적 독서 시간
    @Column(nullable = false)
    private Long totalReadingTime;

    // 계정 생성 일시
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 계정 정보 수정 일시
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * User 엔티티 생성을 위한 빌더 패턴 생성자
     *
     * @param nickname 사용자 닉네임
     * @param email 사용자 이메일
     * @param password 사용자 비밀번호
     * @param gender 사용자 성별
     * @param role 사용자 권한 (기본값: USER)
     */
    @Builder
    public User(String nickname, String email, String password, Gender gender, Role role) {
        this.nickname = nickname;
        this.email = email;
        this.password = password;
        this.gender = gender;
        this.role = role != null ? role : Role.USER;
        this.totalReadingTime = 0L;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 사용자 정보 수정
     *
     * @param request 수정할 정보를 담은 요청 객체
     */
    public void updateProfile(UserUpdateRequest request) {
        this.nickname = request.getNickname();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 누적 독서 시간 추가
     */
    public void updateTotalReadingTime(Long minutes) {
        if (minutes != null && minutes > 0) {
            this.totalReadingTime += minutes;
            this.updatedAt = LocalDateTime.now();
        }
    }

    /**
     * 사용자 비밀번호 수정
     *
     * @param password 수정할 비밀번호
     */
    public void updatePassword(String password) {
        this.password = password;
    }

}
