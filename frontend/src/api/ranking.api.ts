import { api } from './axios';

import type { RankingListResponse, RankingType } from '@/types/ranking.types';

export const rankingApi = {
  /**
   * 기간별 랭킹 목록 조회
   * @param type - 랭킹 타입 (DAILY, WEEKLY, MONTHLY)
   * @returns Top 10 리스트와 내 랭킹 정보
   */
  getRanking: async (type: RankingType): Promise<RankingListResponse> => {
    const { data } = await api.get<{ data: RankingListResponse }>('/ranking', {
      params: { type },
    });
    return data.data;
  },
};
