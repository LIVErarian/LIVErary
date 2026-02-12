import { useQuery } from '@tanstack/react-query';

import { rankingApi } from '@/api/ranking.api';

import type { RankingType } from '@/types/entities/ranking.types';

export const RANKING_KEYS = {
  all: ['ranking'] as const,
  byType: (type: RankingType) => [...RANKING_KEYS.all, type] as const,
};

/**
 * 랭킹 조회 Hook
 * @param type - 랭킹 타입 (DAILY, WEEKLY, MONTHLY)
 * @returns 랭킹 데이터 query
 */
export const useRanking = (type: RankingType) => {
  return useQuery({
    queryKey: RANKING_KEYS.byType(type),
    queryFn: () => rankingApi.getRanking(type),
  });
};
