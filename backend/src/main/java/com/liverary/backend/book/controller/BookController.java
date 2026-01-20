package com.liverary.backend.book.controller;

import com.liverary.backend.book.dto.response.BookListResponse;
import com.liverary.backend.book.service.BookService;
import com.liverary.backend.common.dto.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/book")
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
    public ResponseEntity<BaseResponse<Page<BookListResponse>>> getBooks(@RequestParam(required=false) String category,
                                                                         @RequestParam(defaultValue = "0") int page,
                                                                         @RequestParam(defaultValue = "20")int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<BookListResponse> books = bookService.getBooks(category, pageable);
        return ResponseEntity.ok(BaseResponse.success(books));
    }





}
