package com.liverary.backend.ai.controller;

import com.liverary.backend.ai.service.AiService;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

    /**
     * AI 맞춤형 독서 모임 추천 API
     */
    @GetMapping("/recommend")
    public BaseResponse<List<Room>> getRecommendedRooms(
            @AuthenticationPrincipal UserDetails user
            ){

        UUID userId = getUserId(user);
        List<Room> recommendedRooms = aiService.getRecommendedRooms(userId);

        return BaseResponse.success(recommendedRooms);

    }
}
