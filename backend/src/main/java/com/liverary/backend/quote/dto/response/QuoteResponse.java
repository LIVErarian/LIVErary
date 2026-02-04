package com.liverary.backend.quote.dto.response;

import com.liverary.backend.quote.domain.Quote;
import lombok.Builder;
import lombok.Getter;

/**
 * 명언 조회 응답 DTO 클래스입니다.
 *
 * <p>클라이언트에게 명언 정보를 전달할 때 사용됩니다.</p>
 */
@Getter
@Builder
public class QuoteResponse {
    private Long id;
    private String content;
    private String title;
    private String author;
    private String publisher;

    public static QuoteResponse from(Quote quote) {
        return QuoteResponse.builder()
                .id(quote.getId())
                .content(quote.getContent())
                .title(quote.getTitle())
                .author(quote.getAuthor())
                .publisher(quote.getPublisher())
                .build();
    }
}