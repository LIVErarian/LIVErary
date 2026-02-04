package com.liverary.backend.ranking.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 랭킹 타입 정의하는 Enum 클래스
 */
@Getter
@AllArgsConstructor
public enum RankingType {
    DAILY("일간"),
    WEEKLY("주간"),
    MONTHLY("월간");

    private final String description;
}