package com.liverary.backend.book.service;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.domain.RegStatus;
import com.liverary.backend.book.dto.response.BookDetailResponse;
import com.liverary.backend.book.dto.response.BookListResponse;
import com.liverary.backend.book.repository.BookRepository;
import com.liverary.backend.category.domain.Category;
import com.liverary.backend.category.repository.CategoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookService {
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    /**
     * 도서 목록 조회
     *
     * @param category 카테고리 이름 (선택)
     * @param pageable 페이지네이션
     */
    public Page<BookListResponse> getBooks(String category, Pageable pageable) {
        Page<Book> books;
        
        // 카테고리별 조회
        if (category != null) {
            Category categoryEntity = categoryRepository.findByName(category)
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));


            books = bookRepository.findByCategoryAndRegStatus(
                    categoryEntity,
                    RegStatus.APPROVED,
                    pageable
            );
        }
        // 전체 조회
        else {
            books = bookRepository.findAllApproved(pageable);
        }
        
        return books.map(BookListResponse::from);
    }

    /**
     * 도서 상세 조회
     * @param bookId
     * @return
     */
    public BookDetailResponse getBookDetail(UUID bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(()-> new BaseException(ErrorCode.BOOK_NOT_FOUND));
        return BookDetailResponse.from(book);
    }

    /**
     * 도서 검색
     * @param searchType 검색 유형 (title, author, publisher, keyword)
     * @param keyword 검색 키워드
     * @param category 카테고리 (선택)
     * @param pageable
     * @return
     */
    public Page<BookListResponse> searchBooks(String searchType, String keyword, String category, Pageable pageable) {
        // 검색 키워드 유효성 검사
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BaseException(ErrorCode.INVALID_INPUT_VALUE);
        }

        Page<Book> books;

        // 카테고리 필터가 있는 경우
        if (category != null && !category.trim().isEmpty()) {
            Category categoryEntity = categoryRepository.findByName(category)
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));

            books = bookRepository.searchByCategoryAndKeyword(
                    categoryEntity,
                    keyword,
                    pageable
            );
        }

        // 카테고리 필터가 없는 경우
        else {
            // 검색 타입별 처리
            if ("title".equalsIgnoreCase(searchType)) {
                books = bookRepository.searchByTitleContaining(
                        keyword,
                        pageable
                );
            } else if ("author".equalsIgnoreCase(searchType)) {
                books = bookRepository.searchByAuthorContaining(
                        keyword,
                        pageable
                );
            } else if ("publisher".equalsIgnoreCase(searchType)) {
                books = bookRepository.searchByPublisherContaining(
                        keyword,
                        pageable
                );
            }  else {
                throw new BaseException(ErrorCode.INVALID_INPUT_VALUE);
            }
        }

        return books.map(BookListResponse::from);
    }



}
