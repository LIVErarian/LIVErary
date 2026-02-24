package com.liverary.backend.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 정보 수정을 위한 요청 객체
 */
@Getter
@NoArgsConstructor
public class UserUpdateRequest {

    @NotBlank(message = "닉네임은 필수 입력값입니다.")
    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하여야 합니다.")
    @Pattern(regexp = "^\\S+$", message = "닉네임에 공백을 포함할 수 없습니다.")
    private String nickname;

}