package com.liverary.backend.book.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.domain.RegStatus;
import com.liverary.backend.book.dto.response.BookDetailResponse;
import com.liverary.backend.book.dto.response.BookDto;
import com.liverary.backend.book.dto.response.BookListResponse;
import com.liverary.backend.book.repository.BookRepository;
import com.liverary.backend.category.domain.Category;
import com.liverary.backend.category.repository.CategoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookService {
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final AladinApiService aladinApiService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private static final String SEARCH_KEY_PREFIX = "SEARCH::"; // Redis 키 앞에 붙일 접두어


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
     * 도서 검색
     * DB 조회 -> Redis -> 알라딘 API 호출
     * @param
     * @return
     */
    @Transactional
    public Page<BookListResponse> searchBooks(String type, String keyword, Pageable pageable){

        // 1. DB 검색
        Page<Book> dbBooks = Page.empty();
        if("title".equalsIgnoreCase(type)){
            dbBooks = bookRepository.findByTitleContaining(keyword, pageable);
        }
        else if("author".equalsIgnoreCase(type)){
            dbBooks = bookRepository.findByAuthorContaining(keyword, pageable);
        }

        if(!dbBooks.isEmpty()){
            return dbBooks.map(BookListResponse::from);
        }

        // 2. Redis 검색
        // Key format: SEARCH::[type]::[keyword]
        String redisKey = SEARCH_KEY_PREFIX + type + "::" + keyword;
        String cachedJson = redisTemplate.opsForValue().get(redisKey);
        if (cachedJson != null) {
            try {
                List<BookDto> cachedList = objectMapper.readValue(cachedJson, new TypeReference<List<BookDto>>() {});
                List<BookListResponse> responses = cachedList.stream()
                        .map(BookListResponse::from)
                        .collect(Collectors.toList());
                return new PageImpl<>(responses, pageable, responses.size());
            } catch (Exception e) {
                log.error("Redis Deserialization Error", e);
            }
        }


        // 3. API 검색
        String aladinQueryType = "title".equalsIgnoreCase(type)? "Title":"Author";
        List<BookDto> apiBooks = aladinApiService.searchBooks(keyword, aladinQueryType);
        if(!apiBooks.isEmpty()){
            try{
                String jsonString = objectMapper.writeValueAsString(apiBooks);

                redisTemplate.opsForValue().set(redisKey, jsonString, Duration.ofHours(24));
            }
            catch(Exception e){
                log.error("Redis Serialization Error", e);
            }
        }
        List<BookListResponse> responses = apiBooks.stream()
                .map(BookListResponse::from)
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, responses.size());
    }



    /**
     * 도서 상세 조회
     * @param isbn
     * @return
     */
    public BookDetailResponse getBookDetail(String isbn){
        // 1. DB 조회
        Optional<Book> dbBook = bookRepository.findByIsbn(isbn);

        if(dbBook.isPresent()){
            return BookDetailResponse.from(dbBook.get());
        }

        // 2. API 조회
        List<BookDto> apiResults = aladinApiService.searchBooks(isbn, "ISBN");
        if(!apiResults.isEmpty()){
            return BookDetailResponse.from(apiResults.get(0));
        }
        throw new BaseException(ErrorCode.BOOK_NOT_FOUND);
    }






}
