package com.liverary.backend.book.service;

import com.liverary.backend.book.domain.Book;
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

            System.out.println("DEBUG: Found Category Name=" + categoryEntity.getName() + ", ID=" + categoryEntity.getCategoryId());

            books = bookRepository.findByCategoryAndRegStatus(
                    categoryEntity,
                    Book.RegStatus.APPROVED,
                    pageable
            );
        }
        // 전체 조회
        else {
            books = bookRepository.findAllApproved(pageable);
        }
        
        return books.map(BookListResponse::from);
    }


}
