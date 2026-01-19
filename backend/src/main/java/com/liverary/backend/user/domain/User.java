package com.liverary.backend.user.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User 도메인 엔티티 클래스입니다.
 */
@Entity
@Getter
@Table(name = "USER")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    // 사용자의 고유 식별자 (UUID)
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", columnDefinition = "BINARY(16)")
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
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 계정 정보 수정 일시
    @LastModifiedDate
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
    }

}
