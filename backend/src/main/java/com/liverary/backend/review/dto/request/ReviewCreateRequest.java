package com.liverary.backend.review.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewCreateRequest {

    @NotBlank(message = "댓글 내용을 입력해 주세요.")
    private String content;
}
