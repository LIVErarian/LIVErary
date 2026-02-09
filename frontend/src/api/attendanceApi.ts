import { api } from './axios';

import type {
  AttendanceHistoryApiResponse,
  AttendanceHistoryRequest,
  DailyAttendanceApiResponse,
} from '@/types/attendance.types';

/**
 * 출석 관리 API
 */
export const attendanceApi = {
  /**
   * 일일 출석 체크
   */
  checkDailyAttendance: async () => {
    const { data } =
      await api.post<DailyAttendanceApiResponse>('/attendance/daily');
    return data.data;
  },

  /**
   * 출석 이력 조회 (월별)
   */
  getAttendanceHistory: async (req: AttendanceHistoryRequest) => {
    const { data } = await api.get<AttendanceHistoryApiResponse>(
      '/attendance/history',
      {
        params: { yearMonth: req.yearMonth },
      },
    );
    return data.data;
  },
};
