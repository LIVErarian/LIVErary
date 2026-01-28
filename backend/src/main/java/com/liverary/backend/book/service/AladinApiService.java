package com.liverary.backend.book.service;

import com.liverary.backend.book.dto.response.BookDto;
import com.liverary.backend.book.dto.response.aladin.AladinItemDto;
import com.liverary.backend.book.dto.response.aladin.AladinResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 알라딘 Open API와 통신하여 도서 정보를 검색하는 서비스 클래스
 * 알라딘 API 응답값 가공
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AladinApiService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${aladin.api.key}")
    private String aladinApiKey;

    @Value("${aladin.api.url}")
    private String aladinApiUrl;

    public List<BookDto> searchBooks(String keyword, String type) {

        try {
            // 1. API 요청 URL 생성 (파라미터 설정)
            URI uri = UriComponentsBuilder.fromUriString(aladinApiUrl)
                    .queryParam("ttbkey", aladinApiKey)
                    .queryParam("Query", keyword)
                    .queryParam("QueryType", type)
                    .queryParam("MaxResults", 10)
                    .queryParam("Output", "JS")
                    .queryParam("Version", "20131101")
                    .build()
                    .toUri();

            // 2. API 호출 및 결과를 내부 클래스(AladinResponse)로 매핑
            AladinResponseDto response = restTemplate.getForObject(uri, AladinResponseDto.class);

            // 3. validation
            if (response == null || response.getItem() == null) {
                return Collections.emptyList();
            }

            return response.getItem().stream().map(this::convertToBookDto)
                    .collect(Collectors.toList());


        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private BookDto convertToBookDto(AladinItemDto item) {
        return BookDto.builder()
                .isbn(item.getIsbn())
                .title(item.getTitle())
                .author(item.getAuthor())
                .publisher(item.getPublisher())
                .description(item.getDescription())
                .categoryName(item.getCategoryName())
                .itemId(item.getItemId())
                .coverUrl(item.getCoverUrl())
                .build();
    }
}
