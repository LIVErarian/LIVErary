import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useRanking } from '@/services/queries/useRanking';

import type { RankingResponse, RankingType } from '@/types/ranking.types';

import * as styles from './RankingModal.css';

/**
 * 독서 시간을 시간/분 형식으로 변환
 * @param minutes - 분 단위 독서 시간
 * @returns 포맷된 시간 문자열
 */
const formatReadingTime = (minutes: number): string => {
  if (minutes === 0) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
};

/**
 * 순위에 따른 메달 이모지 반환
 * @param rank - 순위
 * @returns 메달 이모지 또는 순위 숫자
 */
const getRankDisplay = (rank: number): string => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
};

/**
 * 순위에 따른 스타일 클래스 반환
 * @param rank - 순위
 * @returns 스타일 클래스명
 */
const getRankClass = (rank: number): string => {
  if (rank === 1) return styles.goldRank;
  if (rank === 2) return styles.silverRank;
  if (rank === 3) return styles.bronzeRank;
  return '';
};

const TAB_CONFIG: { type: RankingType; label: string }[] = [
  { type: 'DAILY', label: '일간' },
  { type: 'WEEKLY', label: '주간' },
  { type: 'MONTHLY', label: '월간' },
];

export const RankingModal = ({
  isOpen,
  onClose,
  zIndex,
}: {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
}) => {
  const [activeTab, setActiveTab] = useState<RankingType>('DAILY');

  const { data: rankingData, isLoading } = useRanking(activeTab);

  /**
   * 탭 전환 처리
   * @param type - 전환할 랭킹 타입
   */
  const handleTabClick = (type: RankingType) => {
    setActiveTab(type);
  };

  /**
   * 내 랭킹 카드 렌더링
   */
  const renderMyRanking = () => {
    if (!rankingData?.myRanking) return null;

    const { rank, readingTime } = rankingData.myRanking;
    const displayRank = rank === 0 ? '기록 없음' : `${rank}위`;
    const displayTime = formatReadingTime(readingTime);

    return (
      <div className={styles.myRankingCard}>
        <span className={styles.myRankingLabel}>나의 랭킹</span>
        <div className={styles.myRankingInfo}>
          <span className={styles.myRankingRank}>{displayRank}</span>
          {rank > 0 && (
            <span className={styles.myRankingTime}>({displayTime})</span>
          )}
        </div>
      </div>
    );
  };

  /**
   * 랭킹 리스트 렌더링
   */
  const renderRankingList = () => {
    if (isLoading) {
      return <div className={styles.loading}>로딩 중...</div>;
    }

    if (!rankingData?.top10 || rankingData.top10.length === 0) {
      return (
        <div className={styles.emptyState}>아직 랭킹 데이터가 없습니다.</div>
      );
    }

    return rankingData.top10.map((item: RankingResponse, index: number) => {
      const rankNum = item.rank || index + 1;
      const rankDisplay = getRankDisplay(rankNum);
      const rankClass = getRankClass(rankNum);

      return (
        <div
          key={`${item.nickname}-${rankNum}`}
          className={`${styles.listItem} ${rankNum <= 3 ? styles.topRankItem : ''}`}
        >
          <span className={`${styles.rank} ${rankClass}`}>{rankDisplay}</span>
          <span className={styles.nickname}>{item.nickname}</span>
          <span className={styles.readingTime}>
            {formatReadingTime(item.readingTime)}
          </span>
        </div>
      );
    });
  };

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title="🏆 랭킹"
      width="550px"
      zIndex={zIndex}
    >
      <div className={styles.container}>
        {/* 탭 */}
        <div className={styles.tabContainer}>
          {TAB_CONFIG.map(({ type, label }) => (
            <PixelButton
              key={type}
              className={`${styles.tabButton} ${activeTab === type ? styles.activeTab : ''}`}
              onClick={() => handleTabClick(type)}
            >
              {label}
            </PixelButton>
          ))}
        </div>

        {/* 내 랭킹 */}
        {renderMyRanking()}

        {/* 랭킹 리스트 */}
        <div className={styles.listContainer}>{renderRankingList()}</div>
      </div>
    </PixelModal>
  );
};
