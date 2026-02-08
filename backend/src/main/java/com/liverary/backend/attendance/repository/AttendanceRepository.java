package com.liverary.backend.attendance.repository;

import com.liverary.backend.attendance.domain.Attendance;
import com.liverary.backend.attendance.domain.AttendanceType;
import com.liverary.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 출석 기록 Repository
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    /**
     * 특정 사용자의 특정 타입, 특정 날짜 출석 기록이 존재하는지 확인
     *
     * @param user           사용자
     * @param attendanceType 출석 타입
     * @param attendedAt     출석 날짜
     * @return 존재 여부
     */
    boolean existsByUserAndAttendanceTypeAndAttendedAt(
            User user,
            AttendanceType attendanceType,
            LocalDate attendedAt);

    /**
     * 특정 사용자의 기간별 출석 이력 조회
     *
     * @param user      사용자
     * @param startDate 시작 날짜
     * @param endDate   종료 날짜
     * @return 출석 기록 리스트
     */
    List<Attendance> findByUserAndAttendedAtBetween(
            User user,
            LocalDate startDate,
            LocalDate endDate);

    /**
     * 특정 사용자의 특정 타입 출석 기록을 날짜 내림차순으로 조회
     *
     * @param user           사용자
     * @param attendanceType 출석 타입
     * @return 출석 기록 리스트 (최신순)
     */
    List<Attendance> findByUserAndAttendanceTypeOrderByAttendedAtDesc(
            User user,
            AttendanceType attendanceType);
}
