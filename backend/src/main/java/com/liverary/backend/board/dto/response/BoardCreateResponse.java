package com.liverary.backend.board.dto.response;

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
     * @param boardId 생성된 게시글의 UUID
     * @return BoardCreateResponse 객체
     */
    public static BoardCreateResponse from (UUID boardId) {
        return BoardCreateResponse.builder()
                .boardId(boardId)
                .build();
    }

}
