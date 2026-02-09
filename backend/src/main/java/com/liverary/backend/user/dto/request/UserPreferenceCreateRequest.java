package com.liverary.backend.user.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

/**
 * 선호 카테고리 등록을 위한 요청 객체
 */
@Getter
@NoArgsConstructor
public class UserPreferenceCreateRequest {

    private List<UUID> categoryIds;

}