package com.liverary.backend.book.repository;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.category.domain.Category;
import com.liverary.backend.book.domain.RegStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {

    // 전체 도서 목록 조회 (APPROVED만)
    @Query("SELECT b FROM Book b WHERE b.regStatus = 'APPROVED'")
    Page<Book> findAllApproved(Pageable pageable);

    // 카테고리별 도서 목록 조회 (APPROVED만)
    Page<Book> findByCategoryAndRegStatus(
            Category category,
            RegStatus regStatus,
            Pageable pageable
    );

    // 카테고리 + 제목 검색

    // 제목으로 검색

    // 저자로 검색

    // 출판사로 검색
}
