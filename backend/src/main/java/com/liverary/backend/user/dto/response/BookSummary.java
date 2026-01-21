package com.liverary.backend.user.dto.response;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.bookHistory.domain.BookStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class BookSummary {

    private UUID bookId;
    private String categoryName;
    private String title;
    private String author;
    private String coverUrl;
    private BookStatus status;

    public static BookSummary of(Book book, BookStatus status) {
        return BookSummary.builder()
                .bookId(book.getBookId())
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .title(book.getTitle())
                .author(book.getAuthor())
                .coverUrl(book.getCoverUrl())
                .status(status)
                .build();
    }

}