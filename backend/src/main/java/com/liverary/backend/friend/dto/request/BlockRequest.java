package com.liverary.backend.friend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 차단 및 차단 해제 요청을 위한 DTO입니다.
 */
@Getter
@NoArgsConstructor
public class BlockRequest {

    @NotBlank(message = "대상 이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

}