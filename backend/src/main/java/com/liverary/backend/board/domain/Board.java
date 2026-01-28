package com.liverary.backend.board.domain;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
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

    // 책 정보 (홍보 게시판)
    @Column(name = "book_title")
    private String bookTitle;   // 책 제목

    @Column(name = "book_author")
    private String bookAuthor;  // 저자

    @Column(name = "book_cover_url")
    private String bookCoverUrl;// 표지 이미지 URL

    @Column(name = "target_room_id")
    private UUID targetRoomId;

    @Column(name = "category_name")
    private String categoryName;

    /**
     * 게시글 엔티티를 생성하는 빌더 생성자입니다.
     *
     * @param user 작성자
     * @param type 게시판 종류 (자유, 공지 등)
     * @param title 게시글 제목
     * @param content 게시글 본문
     * @param imageUrl 썸네일 이미지 URL
     * @param status 게시글 상태 (공개, 삭제 등)
     * @param bookTitle 책 제목
     * @param bookAuthor 저자
     * @param bookCoverUrl 커버 이미지 URL
     * @param targetRoomId 홍보할 방 Id
     * @param  categoryName 방 또는 책의 카테고리
     */
    @Builder
    public Board(User user, Type type, String title, String content, String imageUrl, Status status,
                 String bookTitle, String bookAuthor, String bookCoverUrl, UUID targetRoomId, String categoryName) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.status = status != null ?  status : Status.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.targetRoomId = targetRoomId;
        this.categoryName = categoryName;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
        this.bookCoverUrl = bookCoverUrl;
    }

    /**
     * 게시글 정보 수정
     * (주의: 홍보 게시판이 아닐 경우 room, book 정보는 null/empty로 초기화됨)
     */
    public void update(String title, String content, String imageUrl,
                       UUID targetRoomId, String categoryName, String bookTitle,
                       String bookAuthor, String bookCoverUrl) {
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.updatedAt = LocalDateTime.now();

        // 홍보 게시판이면 관련 정보 업데이트
        if(this.type == Type.PROMOTION){
            this.targetRoomId = targetRoomId;
            this.categoryName = categoryName;
            this.bookTitle = bookTitle;
            this.bookAuthor = bookAuthor;
            this.bookCoverUrl = bookCoverUrl;
        } else{
            this.targetRoomId = null;
            this.categoryName = null;
            this.bookTitle = null;
            this.bookAuthor = null;
            this.bookCoverUrl = null;
        }
    }

    /**
     * 문의 게시글 댓글 권한 확인 및 상태 변경
     */
    public void validateAndCompleteInquiry(User user) {
        if(this.type != Type.INQUIRY) return;

        if(user.getRole() != Role.ADMIN) {
            throw new BaseException(ErrorCode.INSUFFICIENT_PRIVILEGES);
        }

        this.status = Status.DONE;
    }
}
