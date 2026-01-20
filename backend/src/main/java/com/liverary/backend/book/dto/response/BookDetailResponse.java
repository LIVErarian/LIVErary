package com.liverary.backend.book.dto.response;

import com.liverary.backend.book.domain.Book;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class BookDetailResponse {
    private UUID bookId;
    private String isbn;
    private String title;
    private String author;
    private String publisher;
    private String coverUrl;
    private String purchaseUrl;
    private String content;

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
                .build();
    }
}
