package com.liverary.backend.book.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.domain.RegStatus;
import com.liverary.backend.book.domain.SourceType;
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
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
     *
     * @param keyword 검색 키워드
     * @param pageable 페이지네이션
     * @return Page<BookListResponse> 검색 결과
     */
    @Transactional
    public Page<BookListResponse> searchBooks(String keyword, Pageable pageable) {

        // 1. Redis 검색 (검색 결과 리스트 조회)
        // Key format: SEARCH::Keyword::[keyword]::[page]::[size}
        String redisKey = SEARCH_KEY_PREFIX + "Keyword::" + keyword + "::" + pageable.getPageNumber() + "::" + pageable.getPageSize();
        String cachedJson = redisTemplate.opsForValue().get(redisKey);
        // 캐시가 있으면 바로 반환ㄴ
        if (cachedJson != null) {
            try {
                // JSON 문자열을 List<BookDto>로 역질렬화
                List<BookDto> cachedList = objectMapper.readValue(cachedJson, new TypeReference<List<BookDto>>() {
                });
                // BookDto -> BookListResponse 변환
                List<BookListResponse> responses = cachedList.stream()
                        .map(BookListResponse::from)
                        .collect(Collectors.toList());
                log.info("Redis 캐시 히트: {}", redisKey);
                return new PageImpl<>(responses, pageable, responses.size());
            } catch (Exception e) {
                log.error("Redis Deserialization Error", e);
            }
        }


        // 2. 알라딘 API 호출 & 검색
        String aladinQueryType = "Keyword";
        List<BookDto> apiBooks = aladinApiService.searchBooks(keyword, aladinQueryType, pageable.getPageNumber(), pageable.getPageSize());
        // API 결과를 Redis에 캐싱
        if (!apiBooks.isEmpty()) {

            try {
                // 1) 검색 결과 리스트 저장 (도서 검색 시 사용)
                String jsonString = objectMapper.writeValueAsString(apiBooks);
                redisTemplate.opsForValue().set(redisKey, jsonString, Duration.ofHours(24));
                log.info("Redis 저장 완료: {}", redisKey);

                // 2) 개별 도서 정보 저장 (도서 상세 조회 시 사용)
                for (BookDto book : apiBooks) {
                    String bookKey = "BOOK::" + book.getIsbn();
                    String bookJson = objectMapper.writeValueAsString(book);
                    redisTemplate.opsForValue().set(bookKey, bookJson, Duration.ofHours(24));
                }
            } catch (Exception e) {
                log.error("Redis Serialization Error", e);
            }
        }

        // 4. Page 객체로 변환
        List<BookListResponse> responses = apiBooks.stream()
                .map(BookListResponse::from)
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, responses.size());
    }


    /**
     * 도서 상세 조회
     *
     * @param isbn
     * @return
     */
    public BookDetailResponse getBookDetail(String isbn) {
        // 1. DB 조회
        Optional<Book> dbBook = bookRepository.findByIsbn(isbn);

        if (dbBook.isPresent()) {
            return BookDetailResponse.from(dbBook.get());
        }

        // 2. Redis 조회 (API 호출 전 캐시 확인)
        String bookKey = "BOOK::" + isbn;
        String cachedBookJson = redisTemplate.opsForValue().get(bookKey);

        if (cachedBookJson != null) {
            try {
                BookDto bookDto = objectMapper.readValue(cachedBookJson, BookDto.class);
                return BookDetailResponse.from(bookDto);
            } catch (Exception e) {
                log.error("Redis Deserialization Error - Detail", e);
            }
        }

        // 3. 알라딘 API 조회
        List<BookDto> apiResults = aladinApiService.searchBooks(isbn, "ISBN", 0, 1);
        if (!apiResults.isEmpty()) {
            return BookDetailResponse.from(apiResults.get(0));
        }

        throw new BaseException(ErrorCode.BOOK_NOT_FOUND);

    }

    /**
     * ISBN으로 책 엔티티 조회
     */
    public Optional<Book> findByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn);
    }

    /**
     * BookId로 책 엔티티 조회
     */
    public Optional<Book> findByBookId(UUID bookId) {
        return bookRepository.findById(bookId);
    }


    /**
     * 특정 도서 찜, 방 생성 시 isbn으로 도서 정보를 가져옴
     * - 해당 도서가 DB에 없을 경우, Redis 캐시 확인 / 알라딘 API 호출을 통해 해당 도서 정보를 DB에 저장 후 도서 정보 반환
     *
     * @param isbn
     * @return
     */
    @Transactional
    public Book getOrSaveBook(String isbn) {
        // 1. DB에 있는 경우
        Optional<Book> dbBook = bookRepository.findByIsbn(isbn);
        if (dbBook.isPresent()) {
            return dbBook.get();
        }

        // 2. DB에 없는 경우 -> Reids 캐시 확인
        String bookKey = "BOOK::" + isbn;
        String cachedJson = redisTemplate.opsForValue().get(bookKey);

        BookDto bookDto = null;

        if (cachedJson != null) {
            try {
                bookDto = objectMapper.readValue(cachedJson, BookDto.class);
            } catch (Exception e) {
                log.error("Redis Deserialization Error", e);
            }
        }

        // 3. Redis에도 없을 경우 -> 알라딘 API 호출
        if (bookDto == null) {
            List<BookDto> apiResults = aladinApiService.searchBooks(isbn, "ISBN", 0, 1);
            if (apiResults.isEmpty()) {
                throw new BaseException(ErrorCode.BOOK_NOT_FOUND);
            }
            bookDto = apiResults.get(0);
        }

        // 4. BookDto -> Entity 변환 후 DB에 저장
        String categoryName = bookDto.getCategoryName();
        // 카테고리가 없는 경우
        if (categoryName == null || categoryName.trim().isEmpty()) {
            categoryName = "기타";
        }
        final String finalCategoryName = categoryName;

        Category category = categoryRepository.findByName(finalCategoryName)
                // DB에 없는 카테고리면 새로 생성하기
                .orElseGet(() -> {
                    Category newCategory = Category.builder()
                            .name(finalCategoryName)
                            .build();
                    return categoryRepository.save(newCategory);
                });


        Book newBook = Book.builder()
                .isbn(bookDto.getIsbn())
                .title(bookDto.getTitle())
                .author(bookDto.getAuthor())
                .publisher(bookDto.getPublisher())
                .coverUrl(bookDto.getCoverUrl())
                .itemId(bookDto.getItemId())
                .content(bookDto.getDescription())
                .category(category)
                .sourceType(SourceType.API)
                .regStatus(RegStatus.APPROVED)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        return bookRepository.save(newBook);

    }
}
   
