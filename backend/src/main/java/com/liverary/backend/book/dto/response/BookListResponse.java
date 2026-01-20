package com.liverary.backend.book.dto.response;

import com.liverary.backend.book.domain.Book;
import lombok.AllArgsConstructor;
import lombok.Getter;



@Getter
@AllArgsConstructor
public class BookListResponse {
    private String bookId;
    private String title;
    private String author;
    private String coverUrl;

    public static BookListResponse from(Book book) {
        return new BookListResponse(
                book.getBookId(),
                book.getTitle(),
                book.getAuthor(),
                book.getCoverUrl()
        );
    }

}
