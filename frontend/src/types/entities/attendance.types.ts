import type { CommonResponse } from '../common/api.types';

/**
 * 출석 타입
 */
export type AttendanceType = 'DAILY' | 'READING';

/**
 * 일일 출석 체크 응답
 */
export interface DailyAttendanceResponse {
  attendanceId: string;
  attendanceType: AttendanceType;
  attendedAt: string; // LocalDate -> string (YYYY-MM-DD)
  consecutiveDays: number;
  isFirstTimeToday: boolean;
}

/**
 * 출석 이력 응답 (월별)
 */
export interface AttendanceHistoryResponse {
  attendanceDate: string; // LocalDate -> string (YYYY-MM-DD)
  hasDailyAttendance: boolean;
  hasReadingAttendance: boolean;
}

/**
 * 출석 이력 조회 요청
 */
export interface AttendanceHistoryRequest {
  yearMonth: string; // YYYY-MM 형식
}

export type DailyAttendanceApiResponse =
  CommonResponse<DailyAttendanceResponse>;
export type AttendanceHistoryApiResponse = CommonResponse<
  AttendanceHistoryResponse[]
>;
