import { api } from './axios';

/**
 * 독서 시간 기록 API
 *
 * 백엔드: POST /api/user/reading-time?readingTime={minutes}
 */
export const recordReadingTime = async (minutes: number): Promise<void> => {
  await api.post('/api/user/reading-time', null, {
    params: { readingTime: minutes },
  });
};
