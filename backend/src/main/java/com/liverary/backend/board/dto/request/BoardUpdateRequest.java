package com.liverary.backend.board.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 게시글 수정 요청 DTO
 * 제목, 내용만 변경 가능하도록 제한함
 * PROMOTION 게시판의 경우 방 정보 수정 가능
 */
@Getter
@NoArgsConstructor
public class BoardUpdateRequest {

    @NotBlank(message = "제목을 입력해 주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해 주세요.")
    private String content;

    private UUID roomId;
}
