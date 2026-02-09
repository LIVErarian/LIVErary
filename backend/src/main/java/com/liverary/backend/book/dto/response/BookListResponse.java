package com.liverary.backend.book.dto.response;

import com.liverary.backend.book.domain.Book;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookListResponse {
    private String isbn;
    private Long itemId;
    private String title;
    private String author;
    private String coverUrl;
    private String category;

    // DB entity
    public static BookListResponse from(Book book) {
        return BookListResponse.builder()
                .itemId(book.getItemId())
                .isbn(book.getIsbn())
                .title(book.getTitle())
                .author(book.getAuthor())
                .coverUrl(book.getCoverUrl())
                .category(book.getCategory().getName())
                .build();
    }

    // 알라딘 API DTO (Redis/ALadin)
    public static BookListResponse from(BookDto bookDto) {
        return BookListResponse.builder()
                .itemId(bookDto.getItemId())
                .isbn(bookDto.getIsbn())
                .title(bookDto.getTitle())
                .author(bookDto.getAuthor())
                .coverUrl(bookDto.getCoverUrl())
                .category(bookDto.getCategoryName())
                .build();
    }

}
