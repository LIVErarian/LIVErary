package com.liverary.backend.category.dto.response;

import com.liverary.backend.category.domain.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 카테고리 응답 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class CategoryResponse {

    private UUID categoryId;
    private String name;

    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .name(category.getName())
                .build();
    }
}
