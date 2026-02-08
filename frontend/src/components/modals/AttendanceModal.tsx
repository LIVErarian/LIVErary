import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { attendanceApi } from '@/api/attendanceApi';
import { PixelButton } from '@/components/common/PixelButton';
import { useModalStore } from '@/store/useModalStore';

import type { AttendanceHistoryResponse } from '@/types/attendance.types';

import * as styles from './AttendanceModal.css';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 출석 체크 모달
 * - 일일 출석 체크 기능
 * - 월별 출석 캘린더 표시
 */
export function AttendanceModal({ isOpen }: AttendanceModalProps) {
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  // 출석 이력 조회
  const { data: attendanceHistory, isLoading } = useQuery({
    queryKey: ['attendance', 'history', yearMonth],
    queryFn: () => attendanceApi.getAttendanceHistory({ yearMonth }),
    enabled: isOpen,
  });

  // 출석 체크 mutation
  const checkInMutation = useMutation({
    mutationFn: attendanceApi.checkDailyAttendance,
    onSuccess: () => {
      // 출석 이력 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['attendance', 'history'] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error?.response?.data?.message || '출석 체크에 실패했습니다.';
      openModal('alert', { title: '오류', message });
    },
  });

  // 오늘 날짜의 출석 상태 및 연속 출석일 계산 (useMemo로 파생)
  const { todayChecked, consecutiveDays } = useMemo(() => {
    if (!attendanceHistory) {
      return { todayChecked: false, consecutiveDays: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayData = attendanceHistory.find(
      (item: AttendanceHistoryResponse) => item.attendanceDate === today,
    );
    const isTodayChecked = todayData?.hasDailyAttendance ?? false;

    // 연속 출석일 계산
    let consecutive = 0;
    const sortedHistory = [...attendanceHistory]
      .filter((item) => item.hasDailyAttendance)
      .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));

    if (sortedHistory.length > 0) {
      const currentDate = new Date();
      const checkDate = new Date(currentDate);

      for (let i = 0; i < sortedHistory.length; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasAttendance = sortedHistory.some(
          (item) => item.attendanceDate === dateStr,
        );

        if (hasAttendance) {
          consecutive++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return { todayChecked: isTodayChecked, consecutiveDays: consecutive };
  }, [attendanceHistory]);

  const handleCheckIn = () => {
    checkInMutation.mutate();
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const renderCalendar = () => {
    if (isLoading) {
      return <div className={styles.loadingMessage}>로딩 중...</div>;
    }

    if (!attendanceHistory) {
      return (
        <div className={styles.errorMessage}>
          출석 데이터를 불러올 수 없습니다.
        </div>
      );
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 이번 달의 첫 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 캘린더 시작 날짜 (이전 달 포함, 월요일 시작)
    const startDay = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 월요일 기준으로 조정
    startDay.setDate(startDay.getDate() - daysToSubtract);

    // 캘린더 종료 날짜 (다음 달 포함)
    const endDay = new Date(lastDay);
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek; // 일요일까지
    endDay.setDate(endDay.getDate() + daysToAdd);

    const days: Date[] = [];
    const current = new Date(startDay);
    while (current <= endDay) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // 출석 데이터를 맵으로 변환
    const attendanceMap = new Map<string, AttendanceHistoryResponse>();
    attendanceHistory.forEach((item: AttendanceHistoryResponse) => {
      attendanceMap.set(item.attendanceDate, item);
    });

    const today = new Date().toISOString().split('T')[0];

    return (
      <div className={styles.calendar}>
        {/* 요일 헤더 - 월요일 시작 */}
        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}

        {/* 날짜 셀 */}
        {days.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const isCurrentMonth = day.getMonth() === month;
          const isToday = dateStr === today;
          const attendance = attendanceMap.get(dateStr);

          return (
            <div
              key={dateStr}
              className={`${styles.dayCell} ${!isCurrentMonth ? styles.dayCellOtherMonth : ''} ${isToday ? styles.dayCellToday : ''}`}
            >
              <div className={styles.dayNumber}>{day.getDate()}</div>
              {attendance && (
                <div className={styles.attendanceIndicators}>
                  {attendance.hasDailyAttendance && (
                    <div
                      className={`${styles.attendanceDot} ${styles.dailyDot}`}
                      title="일일 출석"
                    />
                  )}
                  {attendance.hasReadingAttendance && (
                    <div
                      className={`${styles.attendanceDot} ${styles.readingDot}`}
                      title="독서 출석"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {consecutiveDays > 0 && (
          <div className={styles.streakInfo}>
            <span className={styles.streakIcon}>🔥</span>
            <span className={styles.streakText}>연속 출석</span>
            <span className={styles.streakDays}>{consecutiveDays}일</span>
          </div>
        )}
        <PixelButton
          variant={todayChecked ? 'beige' : 'primary'}
          onClick={handleCheckIn}
          disabled={todayChecked || checkInMutation.isPending}
          className={styles.checkInButton}
        >
          {todayChecked
            ? '✓ 오늘 출석 완료'
            : checkInMutation.isPending
              ? '처리 중...'
              : '출석 체크'}
        </PixelButton>
      </div>

      <div className={styles.calendarSection}>
        <div className={styles.monthNavigation}>
          <button
            type="button"
            className={styles.navButton}
            onClick={handlePrevMonth}
          >
            ◀ 이전
          </button>
          <div className={styles.monthLabel}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </div>
          <button
            type="button"
            className={styles.navButton}
            onClick={handleNextMonth}
          >
            다음 ▶
          </button>
        </div>

        {renderCalendar()}

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.attendanceDot} ${styles.dailyDot}`} />
            <span>일일 출석</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.attendanceDot} ${styles.readingDot}`} />
            <span>독서 출석 (30분+)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
