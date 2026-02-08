/**
 * 랭킹 타입 (일간/주간/월간)
 */
export type RankingType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

/**
 * 개별 랭킹 응답
 */
export interface RankingResponse {
  rank: number; // 순위 (0이면 기록 없음)
  nickname: string; // 닉네임
  readingTime: number; // 독서 시간 (분 단위)
}

/**
 * 랭킹 목록 응답
 */
export interface RankingListResponse {
  myRanking: RankingResponse; // 내 랭킹 정보
  top10: RankingResponse[]; // Top 10 리스트
}
