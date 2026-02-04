package com.liverary.backend.board.dto.response;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Status;
import com.liverary.backend.board.domain.Type;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 게시글 목록 조회 시 반환되는 응답 DTO 클래스
 */
@Getter
@Builder
public class BoardListResponse {

    private UUID boardId;
    private String title;
    private String nickname;
    private Type type;
    private Status status;
    private LocalDateTime createdAt;
    private String categoryName;

    /**
     * Board 엔티티를 BoardListResponse DTO로 변환
     *
     * @param board 변환할 Board 엔티티
     * @return 변환된 목록 응답 DTO
     */
    public static BoardListResponse from(Board board) {

        String categoryName = null;

        if (board.getType() == Type.PROMOTION) {
            if (board.getRoom() != null && board.getRoom().getCategory() != null) {
                categoryName = board.getRoom().getCategory().getName();
            } else {
                // Room이 없거나 카테고리가 없는 경우 기본값 처리
                categoryName = "기타";
            }
        }

        return BoardListResponse.builder()
                .boardId(board.getBoardId())
                .title(board.getTitle())
                .nickname(board.getUser().getNickname())
                .type(board.getType())
                .status(board.getStatus())
                .createdAt(board.getCreatedAt())
                .categoryName(categoryName)
                .build();
    }
}
