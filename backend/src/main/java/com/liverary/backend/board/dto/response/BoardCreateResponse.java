package com.liverary.backend.board.dto.response;

import com.liverary.backend.board.domain.Board;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 게시글 생성 응답 DTO
 */
@Getter
@Builder
public class BoardCreateResponse {

    // 생성된 게시글의 ID
    private UUID boardId;

    /**
     * 엔티티의 ID를 기반으로 응답 DTO를 생성
     *
     * @param board 저장된 게시글 엔티티 객체
     * @return BoardCreateResponse 객체
     */
    public static BoardCreateResponse from (Board board) {
        return BoardCreateResponse.builder()
                .boardId(board.getBoardId())
                .build();
    }

}
