package com.liverary.backend.board.domain;

import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 게시글(Board) 도메인 엔티티 클래스입니다.
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "board")
public class Board {

    // 게시글 식별자
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "board_id")
    private UUID boardId;

    // 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 게시글 카테고리
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;

    // 제목
    @Column(nullable = false, length = 255)
    private String title;

    // 내용
    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    // 이미지 url (nullable)
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    // 게시글 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    // 생성 일자
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    // 수정 일자
    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 게시글 엔티티를 생성하는 빌더 생성자입니다.
     *
     * @param user 작성자
     * @param type 게시판 종류 (자유, 공지 등)
     * @param title 게시글 제목
     * @param content 게시글 본문
     * @param imageUrl 썸네일 이미지 URL
     * @param status 게시글 상태 (공개, 삭제 등)
     */
    @Builder
    public Board(User user, Type type, String title, String content, String imageUrl, Status status){
        this.user = user;
        this.type = type;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.status = status != null ?  status : Status.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 게시글 정보 수정
     */
    public void update(String title, String content, String imageUrl){
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.updatedAt = LocalDateTime.now();
    }
}
