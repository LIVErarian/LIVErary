package com.liverary.backend.ai.controller;

import com.liverary.backend.ai.service.AiService;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.dto.response.RoomListResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
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
     * 사용자에게 추천 방 목록을 제공합니다.
     *
     * @param user       Spring Security를 통해 인증된 사용자 정보
     * @param categoryId 추천 기준이 되는 카테고리 ID (선택)
     * @return 추천 방 목록을 포함한 공통 응답 객체
     */
    @GetMapping("/recommend")
    public BaseResponse<List<RoomListResponse>> getRecommendedRooms(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(name = "categoryId", required = false) UUID categoryId
            ){

        UUID userId = getUserId(user);
        List<RoomListResponse> recommendedRooms = aiService.getRecommendedRooms(userId, categoryId);

        return BaseResponse.success(recommendedRooms);

    }
}
