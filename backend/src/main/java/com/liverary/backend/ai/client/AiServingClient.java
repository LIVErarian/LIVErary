package com.liverary.backend.ai.client;

import com.liverary.backend.ai.dto.request.AiRecommendRequest;
import com.liverary.backend.ai.dto.response.AiRecommendResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiServingClient {

    private final WebClient aiWebClient;

    public AiRecommendResponse sendRecommendationRequest(AiRecommendRequest request) {

        try {
            return aiWebClient.post()
                    .uri("/recommend")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AiRecommendResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("AI Server Error: {}", e.getMessage());
            throw new BaseException(ErrorCode.AI_SERVER_ERROR);
        }
    }
}
