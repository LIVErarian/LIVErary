package com.liverary.backend.ranking.controller;

import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.ranking.domain.RankingType;
import com.liverary.backend.ranking.dto.response.RankingListResponse;
import com.liverary.backend.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails; // Security 설정에 맞춰 변경
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;
import com.liverary.backend.user.domain.ReadingLog;
import com.liverary.backend.user.repository.ReadingLogRepository;

@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;
    private final ReadingLogRepository readingLogRepository;

    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

    /**
     * 기간별 랭킹 목록 조회 API
     *
     * @param user  인증된 사용자 정보
     * @param type  조회할 랭킹 타입
     * @return  Top 10 리스트와 내 랭킹 정보가 담긴 응답 객체
     */
    @GetMapping
    public BaseResponse<RankingListResponse> getRanking(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam RankingType type) {

        UUID userId = getUserId(user);
        return BaseResponse.success(rankingService.getRanking(userId, type));
    }

    /**
     * [ADMIN] 랭킹 데이터 복구 (Redis 초기화 시 사용)
     */
    @PostMapping("/restore")
    public BaseResponse<Void> restoreRankings() {
        // 모든 ReadingLog 조회
        List<ReadingLog> logs = readingLogRepository.findAll();
        
        // Redis 복구 수행
        rankingService.restoreRankings(logs);
        
        return BaseResponse.success();
    }
}