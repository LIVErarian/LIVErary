package com.liverary.backend.book.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 표준 도서 데이터 객체
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookDto {

    private String isbn; // isbn 13
    private String title;
    private String author;
    private String publisher;
    private String description;
    private String coverUrl;
    private String categoryName;
    private Long itemId; // 알라딘 고유 ID
}
