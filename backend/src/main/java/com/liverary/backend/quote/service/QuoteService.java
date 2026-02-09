package com.liverary.backend.quote.service;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.quote.domain.Quote;
import com.liverary.backend.quote.dto.response.QuoteResponse;
import com.liverary.backend.quote.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Quote 도메인의 비즈니스 로직을 처리하는 서비스 클래스입니다.
 *
 * <p>명언 조회 관련 기능을 제공합니다.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuoteService {

    private final QuoteRepository quoteRepository;

    /**
     * 데이터베이스에서 무작위로 선택된 명언을 조회합니다.
     *
     * @return 무작위 명언 정보를 담은 QuoteResponse
     * @throws BaseException 명언이 존재하지 않을 경우 발생
     */
    public QuoteResponse getRandomQuote() {
        Quote quote = quoteRepository.findRandom()
                .orElseThrow(() -> new BaseException(ErrorCode.QUOTE_NOT_FOUND));

        return QuoteResponse.from(quote);
    }
}