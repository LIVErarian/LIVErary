import { useEffect, useRef } from 'react';

import { recordReadingTime } from '@/api/reading.api';
import { useGameStore } from '@/store/useGameStore';
import { useReadingStore } from '@/store/useReadingStore';

export const useReadingTimer = () => {
  const { isReading, elapsedSeconds, tick, endReading } = useReadingStore();
  const currentFloor = useGameStore((state) => state.currentFloor);
  const previousFloor = useRef<string | null>(null);

  // 1초마다 타이머 증가
  useEffect(() => {
    if (!isReading) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isReading, tick]);

  // 2층 이탈 감지 및 자동 저장
  useEffect(() => {
    if (
      previousFloor.current === 'readingFloor' &&
      currentFloor !== 'readingFloor' &&
      isReading &&
      elapsedSeconds > 0
    ) {
      const minutes = Math.floor(elapsedSeconds / 60);

      if (minutes > 0) {
        recordReadingTime(minutes)
          .then(() => console.log(`독서 시간 ${minutes}분 저장 완료`))
          .catch((error) => console.error('저장 실패:', error));
      }

      endReading();
    }

    previousFloor.current = currentFloor;
  }, [currentFloor, isReading, elapsedSeconds, endReading]);

  // 페이지 이탈 시 자동 저장
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isReading && elapsedSeconds > 0) {
        const minutes = Math.floor(elapsedSeconds / 60);

        if (minutes > 0) {
          const formData = new FormData();
          formData.append('readingTime', String(minutes));
          navigator.sendBeacon('/api/user/reading-time', formData);
        }

        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isReading, elapsedSeconds]);

  // 시간 포맷 (HH:MM)
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return [hours, minutes].map((v) => String(v).padStart(2, '0')).join(':');
  };

  // 상세 포맷 (호버용)
  const formatTimeDetailed = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}시간`);
    if (minutes > 0) parts.push(`${minutes}분`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}초`);

    return parts.join(' ');
  };

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    formattedTimeDetailed: formatTimeDetailed(elapsedSeconds),
  };
};
