package com.liverary.backend.user.dto.response;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.bookHistory.domain.BookStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 마이페이지 도서 목록 조회를 위한 요약 정보 데이터 객체
 */
@Getter
@Builder
public class BookSummary {

    private UUID bookId;
    private String categoryName;
    private String title;
    private String author;
    private String coverUrl;
    private String isbn;
    private BookStatus status;

    /**
     * Book 엔티티와 상태 정보를 기반으로 BookSummary 객체 생성
     *
     * @param book   도서 엔티티
     * @param status 도서 상태 Enum
     * @return 생성된 BookSummary 객체
     */
    public static BookSummary of(Book book, BookStatus status) {
        return BookSummary.builder()
                .bookId(book.getBookId())
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .title(book.getTitle())
                .author(book.getAuthor())
                .coverUrl(book.getCoverUrl())
                .isbn(book.getIsbn())
                .status(status)
                .build();
    }

}