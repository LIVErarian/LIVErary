package com.liverary.backend.user.dto.response;

import com.liverary.backend.user.domain.UserPreference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

/**
 * 사용자가 설정한 선호 카테고리 목록 반환
 */
@Getter
@Builder
@AllArgsConstructor
public class UserPreferenceResponse {

    private List<CategorySummary> categories;

    /**
     * UserPreference 엔티티 리스트를 기반으로 응답 객체를 생성합니다.
     *
     * @param preferences 변환할 선호 카테고리 엔티티 목록
     * @return 선호 카테고리 정보가 통합된 UserPreferenceResponse 객체
     */
    public static UserPreferenceResponse from(List<UserPreference> preferences) {
        return UserPreferenceResponse.builder()
                .categories(preferences.stream()
                                    .map(CategorySummary::from)
                                    .toList())
                .build();
    }

}