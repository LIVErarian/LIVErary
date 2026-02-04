package com.liverary.backend.room.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 입장 코드로 비공개방 검색을 위한 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class CodeSearchRequest {

    @NotBlank(message = "입장 코드를 입력해주세요.")
    private String code;

}
