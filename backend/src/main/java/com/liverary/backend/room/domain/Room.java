package com.liverary.backend.room.domain;

import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import jdk.jfr.Category;
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
 * 메타버스 공간(방) 정보를 담는 엔티티입니다.
 */
@Entity
@Getter
@Table(name = "room")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Room {
    // 방의 고유 식별자 (UUID)
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID roomId;

    // 연관된 책 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    // 연관된 카테고리 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // 생성한 유저 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User creator;

    // 방 제목
    @Column(nullable = false)
    private String title;

    // 방의 유형
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType;

    // 방 공개 여부
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessType accessType;

    // 방의 진행 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    // 방의 최대 인원
    @Column(nullable = false)
    private Integer maxUser;

    // 방의 현재 인원
    @Column(nullable = false)
    private Integer currentCount;

    // 방의 초대 코드
    @Column(nullable = false)
    private String code;

    // 방의 시작 시각
    @Column(nullable = false)
    private LocalDateTime startAt;

    // 방의 종료 시각
    private LocalDateTime endAt;

    // 방의 생성일시
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // 방의 수정일시
    @LastModifiedDate
    @Column(updatable = false)
    private LocalDateTime updatedAt;

    /**
     * Room 엔티티 생성을 위한 빌더 패턴 생성자
     *
     * @param title 방 제목
     * @param roomType 방 유형
     * @param accessType 방의 공개 여부
     * @param maxUser 방의 최대 인원
     * @param creator 방을 생성한 유저
     * @param book 방에서 이야기할 책
     * @param category 방에서 이야기할 카테고리
     * @param code 방의 초대 코드
     * @param startAt 방을 시작하는 시각 (기본값: 생성일시)
     */
    @Builder
    public Room(String title, RoomType roomType, AccessType accessType, Integer maxUser, User creator, Book book, Category category, String code, LocalDateTime startAt) {
        this.title = title;
        this.roomType = roomType;
        this.accessType = accessType;
        this.maxUser = maxUser;
        this.creator = creator;
        this.book = book;
        this.category = category;

        // 방을 생성하면 UUID 기반 6자리 영문코드를 자동으로 생성합니다.
        if (code == null || code.isBlank()) {
            this.code = java.util.UUID.randomUUID().toString()
                    .replace("-", "")
                    .substring(0, 6)
                    .toUpperCase();
        } else {
            this.code = code;
        }

        this.startAt = (startAt != null) ? startAt : LocalDateTime.now();

        this.status = RoomStatus.LIVE;
        this.currentCount = 0;
    }

    /**
     * 현재 인원 추가를 위한 비즈니스 로직입니다.
     *
     * 방에 인원을 1명 추가합니다.
     */
    public void increaseCurrentCount() {
        this.currentCount++;
    }

    /**
     * 현재 인원 감소를 위한 비즈니스 로직입니다.
     *
     * 방에 인원을 1명 감소시킵니다.
     */
    public void decreaseCurrentCount() {
        if (this.currentCount > 0) {
            this.currentCount--;
        }
    }

    /**
     * 방 종료를 위한 비즈니스 로직입니다.
     *
     * 방 상태를 종료(FINISHED)로 변경합니다.
     */
    public void finish() {
        this.status = RoomStatus.FINISHED;
    }

}
