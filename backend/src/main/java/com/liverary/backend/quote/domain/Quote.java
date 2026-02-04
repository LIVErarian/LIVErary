package com.liverary.backend.quote.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 책 속 명언(Quote)에 대한 엔티티 클래스입니다.
 *
 * <p>책에서 추천한 명언의 내용, 출처 책 정보, 저자, 출판사 등을 담습니다.
 * 사용자들이 조회할 수 있는 일일 명언으로 활용됩니다.</p>
 */
@Entity
@Getter
@Table(name = "quote")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quote_id")
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String publisher;
}