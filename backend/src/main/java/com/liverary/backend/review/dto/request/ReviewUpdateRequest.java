package com.liverary.backend.review.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewUpdateRequest {

    @NotBlank(message = "수정할 내용을 입력해 주세요.")
    private String content;
}
