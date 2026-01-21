package com.liverary.backend.board.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시글 수정 요청 DTO
 * 제목, 내용, 이미지 URL만 변경 가능하도록 제한함
 */
@Getter
@NoArgsConstructor
public class BoardUpdateRequest {

    @NotBlank(message = "제목을 입력해 주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해 주세요.")
    private String content;

    private String imageUrl;
}
