package com.liverary.backend.book.dto.response;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.dto.response.aladin.AladinItemDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 도서 상세 정보 응답 DTO
 * DB/Aladin API 검색 결과로 가져온 도서 상세 정보
 *
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookDetailResponse {
    private UUID bookId;
    private Long itemId;
    private String isbn;
    private String title;
    private String author;
    private String publisher;
    private String coverUrl;
    private String purchaseUrl;
    private String content;
    private String category;

    // DB 엔티티 -> 상세 응답 DTO 변환
    public static BookDetailResponse from(Book book) {
        return BookDetailResponse.builder()
                .bookId(book.getBookId())
                .isbn(book.getIsbn())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .coverUrl(book.getCoverUrl())
                .purchaseUrl("https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=" + book.getItemId())
                .content(book.getContent())
                .category(book.getCategory().getName())
                .build();
    }

    // 알라딘 DTO -> 상세 응답 DTO 변환
    public static BookDetailResponse from(BookDto bookDto){
        return BookDetailResponse.builder()
                .bookId(null) // 미저장 상태
                .itemId(bookDto.getItemId())
                .isbn(bookDto.getIsbn())
                .title(bookDto.getTitle())
                .author(bookDto.getAuthor())
                .publisher(bookDto.getPublisher())
                .coverUrl(bookDto.getCoverUrl())
                .purchaseUrl("https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=" + bookDto.getItemId())
                .content(bookDto.getDescription())
                .category(bookDto.getCategoryName())
                .build();
    }


}
