package com.liverary.backend.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 기본 채팅 데이터 구조.
 */
@Getter
@NoArgsConstructor
public class BaseChat {

    @NotNull
    private ChatType type;

    @NotBlank
    private String content;
}
