package com.liverary.backend.book.dto.response.aladin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 알라딘 API 응답 내부 개별 도서 정보 매핑 객체
 * - AladinResponseDto의 'item' 리스트에 담기는 상세 도서 정보
 * - 알라딘 API 응답(JSON)을 받아서, Entity에 맞는 필드명으로 매핑 & 카테고리 저장
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // API 응답 중 매핑하지 않은 불필요한 필드는 무시
public class AladinItemDto {
    private String title;
    private String author;
    private String publisher;

    @JsonProperty("isbn13")
    private String isbn;

    @JsonProperty("cover")
    private String coverUrl;

    private Long itemId; // 알라딘 고유 도서 ID (도5r서 상세 보기: 구매 URL 생성 시 필요)
    private String description; // 테이블에서 content로 매핑
    private String categoryName; // 카테고리 전체 경로 (e.g. 국내도서>사회과학>...)

    @JsonProperty("categoryName")
    public void setCategoryName(String categoryName) {
        if(categoryName == null || categoryName.isEmpty()){
            this.categoryName = "기타";
            return;
        }
        // parsing: e.g. "국내도서>사회과학>..." -> "사회과학"
        String[] parts = categoryName.split(">");
        if(parts.length > 1){
            this.categoryName = parts[1].trim();
        }
        else{
            this.categoryName = parts[0].trim();
        }
    }
}
