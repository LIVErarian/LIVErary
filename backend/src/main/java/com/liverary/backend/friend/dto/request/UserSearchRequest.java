package com.liverary.backend.friend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 다른 사용자 검색 요청을 위한 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class UserSearchRequest {

    @NotBlank(message = "검색할 이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

}
