package com.liverary.backend.user.dto.response;

import com.liverary.backend.user.domain.UserPreference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.util.UUID;

/**
 * 카테고리의 핵심 정보(ID, 이름)를 담는 요약 정보 데이터 객체
 */
@Getter
@Builder
@AllArgsConstructor
public class CategorySummary {

    private UUID categoryId;
    private String name;

    /**
     * UserPreference 엔티티로부터 카테고리 요약 정보 생성
     *
     * @param preference 선호 카테고리 엔티티
     * @return 카테고리 ID와 이름이 담긴 CategorySummary 객체
     */
    public static CategorySummary from(UserPreference preference) {
        return CategorySummary.builder()
                .categoryId(preference.getCategory().getCategoryId())
                .name(preference.getCategory().getName())
                .build();
    }

}