import { useEffect, useState } from 'react';

import * as styles from './LoadingScreen.css';

interface LoadingScreenProps {
  progress: number; // 0.0 ~ 1.0
}

const LOADING_MESSAGES = [
  '사서가 도서관 문을 열고 있습니다...',
  '책장에 먼지를 털어내는 중...',
  '오늘의 추천 도서를 고르고 있어요...',
  '조용한 독서 공간을 준비하고 있습니다...',
  '따뜻한 커피를 내리고 있습니다...',
];

export const LoadingScreen = ({ progress }: LoadingScreenProps) => {
  const [message, setMessage] = useState(LOADING_MESSAGES[0]);
  const percentage = Math.round(progress * 100);

  // 2.5초마다 로딩 멘트 랜덤 변경
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setMessage(LOADING_MESSAGES[randomIndex]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {/* 통통 튀는 아이콘 */}
        <div className={styles.icon}>📚</div>

        {/* 게임 제목 */}
        <h1 className={styles.title}>LIVErary</h1>

        {/* 로딩 게이지 */}
        <div className={styles.barContainer}>
          <div className={styles.barFill} style={{ width: `${percentage}%` }} />
        </div>

        {/* 퍼센트 */}
        <p className={styles.percentText}>{percentage}%</p>

        {/* 랜덤 메시지 */}
        <p className={styles.messageText}>{message}</p>
      </div>
    </div>
  );
};
