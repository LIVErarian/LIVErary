import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { recordReadingTime } from '@/api/reading.api';
import { useGameStore } from '@/store/useGameStore';
import { useReadingStore } from '@/store/useReadingStore';

export const useReadingTimer = () => {
  const queryClient = useQueryClient();
  const { isReading, elapsedSeconds, tick, endReading } = useReadingStore();
  const currentFloor = useGameStore((state) => state.currentFloor);
  const previousFloor = useRef<string | null>(null);

  // 1초마다 타이머 증가
  useEffect(() => {
    if (!isReading) return;

    const interval = setInterval(() => {
      const { isPaused } = useReadingStore.getState();
      if (!isPaused) {
        tick();
      }
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
          .then(() => {
            console.log(`독서 시간 ${minutes}분 저장 완료`);
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
          })
          .catch((error) => console.error('저장 실패:', error));
      }

      endReading();
    }

    previousFloor.current = currentFloor;
  }, [currentFloor, isReading, elapsedSeconds, endReading, queryClient]);

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
};
