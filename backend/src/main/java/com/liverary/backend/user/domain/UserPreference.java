package com.liverary.backend.user.domain;

import com.liverary.backend.category.domain.Category;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Table(
        name = "user_preference",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_category",
                        columnNames = {"user_id", "category_id"}
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "preference_id")
    private UUID preferenceId; // 선호 넘버 (PK)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 유저 넘버 (FK)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category; // 카테고리 넘버 (FK)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 생성일시

    @Column(nullable = false)
    private LocalDateTime updatedAt; // 수정일시

    @Builder
    public UserPreference(User user, Category category) {
        this.user = user;
        this.category = category;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

}