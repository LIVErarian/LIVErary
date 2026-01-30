package com.liverary.backend.book.controller;

import com.liverary.backend.book.dto.response.BookDetailResponse;
import com.liverary.backend.book.dto.response.BookListResponse;
import com.liverary.backend.book.service.BookService;
import com.liverary.backend.common.dto.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/book")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    /**
     * 도서 목록 조회 API
     * - GET /book: 전체 조회
     * - GET /book?category=소설: 카테고리별 조회
     * @param category
     * @param page
     * @param size
     * @return
     */
    @GetMapping
    public BaseResponse<Page<BookListResponse>> getBooks(@RequestParam(required=false) String category,
                                                                         @RequestParam(defaultValue = "0") int page,
                                                                         @RequestParam(defaultValue = "20")int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<BookListResponse> books = bookService.getBooks(category, pageable);
        return BaseResponse.success(books);
    }

    /**
     * 도서 상세 조회 API (DB -> redis -> Aladin API)
     * - GET /book/{isbn}
     * @param isbn
     * @return
     */
    @GetMapping("/{isbn}")
    public BaseResponse<BookDetailResponse> getBookDetail(@PathVariable String isbn){
        BookDetailResponse bookDetail =
                bookService.getBookDetail(isbn);
        return BaseResponse.success(bookDetail);
    }

    /**
     * 도서 검색 API
     *  - GET /book/search?type={searchType}&keyword={keyword}
     * @param type 검색 유형 (title, author)
     * @param keyword 검색 키워드
     * @return
     */
    @GetMapping("/search")
    public BaseResponse<Page<BookListResponse>> searchBooks(
            @RequestParam String type,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page,size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BookListResponse> books = bookService.searchBooks(type, keyword, pageable);
        return BaseResponse.success(books);
    }
}
