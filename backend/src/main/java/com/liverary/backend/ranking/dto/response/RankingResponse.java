package com.liverary.backend.ranking.dto.response;

import com.liverary.backend.user.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RankingResponse {
    private int rank;           // 순위
    private String nickname;    // 닉네임
    private Long readingTime;   // 독서 시간 (분 단위)

    public static RankingResponse of(int rank, User user, Long readingTime) {
        return RankingResponse.builder()
                .rank(rank)
                .nickname(user.getNickname())
                .readingTime(readingTime)
                .build();
    }

    // 랭킹 기록이 없을 때 반환할 기본값
    public static RankingResponse empty(User user) {
        return RankingResponse.builder()
                .rank(0) // 0등 = 기록 없음
                .nickname(user.getNickname())
                .readingTime(0L)
                .build();
    }
}