package com.liverary.backend.quote.controller;

import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.quote.dto.response.QuoteResponse;
import com.liverary.backend.quote.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 명언(Quote) 조회 요청을 처리하는 REST 컨트롤러입니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quote")
public class QuoteController {

    private final QuoteService quoteService;

    /**
     * 무작위로 선택된 명언을 조회합니다.
     *
     * <p>매 요청마다 다른 명언이 반환될 수 있습니다.
     * 주로 홈 화면이나 초대 화면의 일일 명언으로 표시됩니다.</p>
     *
     * @return 무작위 명언 정보를 포함한 BaseResponse
     */
    @GetMapping("/random")
    public BaseResponse<QuoteResponse> getRandomQuote() {
        return BaseResponse.success(quoteService.getRandomQuote());
    }
}