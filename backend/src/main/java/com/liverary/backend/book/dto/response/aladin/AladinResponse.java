package com.liverary.backend.book.dto.response.aladin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * 알라딘 상품 검색 API의 전체 응답 결과를 담는 DTO
 * - API 응답의 최상위 객체
 * - 검색 결과에 대한 메타 정보 (버전, 전체 개수 등)와 실제 도서 목록(item)을 포함함
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true) // API 응답 중 매핑하지 않은 불필요한 필드는 무시
public class AladinResponse {
    private List<AladinItemDto> item; // 도서 리스트
}
