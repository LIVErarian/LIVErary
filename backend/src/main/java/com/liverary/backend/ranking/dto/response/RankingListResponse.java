package com.liverary.backend.ranking.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

/**
 * 내 랭킹과 Top 10 리스트를 한 번에 담는 응답 객체
 */
@Getter
@Builder
public class RankingListResponse {
    private RankingResponse myRanking;
    private List<RankingResponse> top10;

    public static RankingListResponse of(RankingResponse myRanking, List<RankingResponse> top10) {
        return RankingListResponse.builder()
                .myRanking(myRanking)
                .top10(top10)
                .build();
    }
}