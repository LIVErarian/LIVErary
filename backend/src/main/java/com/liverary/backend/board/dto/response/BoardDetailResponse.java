package com.liverary.backend.board.dto.response;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Status;
import com.liverary.backend.board.domain.Type;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 게시글 상세 조회 시 반환되는 응답 DTO 클래스
 */
@Getter
@Builder
public class BoardDetailResponse {

    private UUID boardId;
    private String nickname;
    private String title;
    private String content;
    private Type type;
    private Status status;
    private String imageUrl;
    private LocalDateTime createdAt;
    // 책 정보는 게시글 타입이 PROMOTION이 아닐 경우 null일 수 있음
    private String bookTitle;
    private String bookAuthor;
    private String bookCoverUrl;

    /**
     * Board 엔티티를 BoardDetailResponse DTO로 변환
     *
     * @param board 변환할 Board 엔티티
     * @return 변환된 상세 응답 DTO
     */
    public static BoardDetailResponse from(Board board) {
        return BoardDetailResponse.builder()
                .boardId(board.getBoardId())
                .nickname(board.getUser().getNickname())
                .title(board.getTitle())
                .content(board.getContent())
                .type(board.getType())
                .status(board.getStatus())
                .imageUrl(board.getImageUrl())
                .createdAt(board.getCreatedAt())
                .bookTitle(board.getBookTitle())
                .bookAuthor(board.getBookAuthor())
                .bookCoverUrl(board.getBookCoverUrl())
                .build();
    }
}
