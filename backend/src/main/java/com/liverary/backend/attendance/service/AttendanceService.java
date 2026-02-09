package com.liverary.backend.attendance.service;

import com.liverary.backend.attendance.domain.Attendance;
import com.liverary.backend.attendance.domain.AttendanceType;
import com.liverary.backend.attendance.dto.response.AttendanceHistoryResponse;
import com.liverary.backend.attendance.dto.response.DailyAttendanceResponse;
import com.liverary.backend.attendance.repository.AttendanceRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * 출석 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    /**
     * 일일 출석 체크
     *
     * @param userId 사용자 ID
     * @return 출석 결과 응답
     */
    @Transactional
    public DailyAttendanceResponse checkDailyAttendance(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        LocalDate today = LocalDate.now();

        // 이미 오늘 일일 출석했는지 확인
        boolean alreadyAttended = attendanceRepository.existsByUserAndAttendanceTypeAndAttendedAt(
                user, AttendanceType.DAILY, today);

        if (alreadyAttended) {
            throw new BaseException(ErrorCode.ALREADY_ATTENDED);
        }

        // 출석 기록 생성
        Attendance attendance = Attendance.builder()
                .user(user)
                .attendanceType(AttendanceType.DAILY)
                .attendedAt(today)
                .build();

        attendanceRepository.save(attendance);

        // 연속 출석 일수 계산
        Integer consecutiveDays = calculateConsecutiveDays(user, AttendanceType.DAILY);

        log.info("User {} checked daily attendance. Consecutive days: {}", userId, consecutiveDays);

        return DailyAttendanceResponse.builder()
                .attendanceId(attendance.getAttendanceId())
                .attendanceType(AttendanceType.DAILY)
                .attendedAt(today)
                .consecutiveDays(consecutiveDays)
                .isFirstTimeToday(true)
                .build();
    }

    /**
     * 독서 출석 체크
     *
     * @param userId 사용자 ID
     */
    @Transactional
    public void checkReadingAttendance(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        LocalDate today = LocalDate.now();

        // 이미 오늘 독서 출석했는지 확인
        boolean alreadyAttended = attendanceRepository.existsByUserAndAttendanceTypeAndAttendedAt(
                user, AttendanceType.READING, today);

        if (alreadyAttended) {
            // 이미 독서 출석했으면 중복 기록하지 않음
            return;
        }

        // 독서 출석 기록 생성
        Attendance attendance = Attendance.builder()
                .user(user)
                .attendanceType(AttendanceType.READING)
                .attendedAt(today)
                .build();

        attendanceRepository.save(attendance);

        log.info("User {} achieved reading attendance (30+ minutes)", userId);
    }

    /**
     * 출석 이력 조회 (월별)
     *
     * @param userId    사용자 ID
     * @param yearMonth 조회할 년월 (YYYY-MM 형식)
     * @return 해당 월의 출석 이력 리스트
     */
    public List<AttendanceHistoryResponse> getAttendanceHistory(
            UUID userId,
            String yearMonth) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // yearMonth를 LocalDate로 파싱 (YYYY-MM)
        LocalDate startDate = LocalDate.parse(yearMonth + "-01");
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Attendance> attendances = attendanceRepository.findByUserAndAttendedAtBetween(
                user, startDate, endDate);

        // 날짜별로 그룹화
        Map<LocalDate, Map<AttendanceType, Boolean>> attendanceMap = new HashMap<>();

        for (Attendance attendance : attendances) {
            attendanceMap
                    .computeIfAbsent(attendance.getAttendedAt(), k -> new HashMap<>())
                    .put(attendance.getAttendanceType(), true);
        }

        // 응답 생성
        List<AttendanceHistoryResponse> responses = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            Map<AttendanceType, Boolean> dayAttendance = attendanceMap.getOrDefault(
                    currentDate, new HashMap<>());

            responses.add(AttendanceHistoryResponse.builder()
                    .attendanceDate(currentDate)
                    .hasDailyAttendance(dayAttendance.getOrDefault(AttendanceType.DAILY, false))
                    .hasReadingAttendance(dayAttendance.getOrDefault(AttendanceType.READING, false))
                    .build());

            currentDate = currentDate.plusDays(1);
        }

        return responses;
    }

    /**
     * 연속 출석 일수 계산
     *
     * @param user           사용자
     * @param attendanceType 출석 타입
     * @return 연속 출석 일수
     */
    private Integer calculateConsecutiveDays(User user, AttendanceType attendanceType) {
        List<Attendance> attendances = attendanceRepository
                .findByUserAndAttendanceTypeOrderByAttendedAtDesc(user, attendanceType);

        if (attendances.isEmpty()) {
            return 1; // 오늘이 첫 출석
        }

        int consecutiveDays = 1; // 오늘 출석 포함
        LocalDate expectedDate = LocalDate.now().minusDays(1);

        for (Attendance attendance : attendances) {
            if (attendance.getAttendedAt().equals(expectedDate)) {
                consecutiveDays++;
                expectedDate = expectedDate.minusDays(1);
            } else {
                break; // 연속이 끊김
            }
        }

        return consecutiveDays;
    }
}
