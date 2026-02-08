package com.liverary.backend.attendance.controller;

import com.liverary.backend.attendance.dto.response.AttendanceHistoryResponse;
import com.liverary.backend.attendance.dto.response.DailyAttendanceResponse;
import com.liverary.backend.attendance.service.AttendanceService;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 출석 관리 API 컨트롤러
 */
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

    /**
     * 일일 출석 체크
     *
     * @param user 인증된 사용자 정보
     * @return 출석 결과 응답
     */
    @PostMapping("/daily")
    public BaseResponse<DailyAttendanceResponse> checkDailyAttendance(
            @AuthenticationPrincipal UserDetails user) {

        UUID userId = getUserId(user);

        DailyAttendanceResponse response = attendanceService.checkDailyAttendance(userId);

        return BaseResponse.success(response);
    }

    /**
     * 출석 이력 조회
     *
     * @param user      인증된 사용자 정보
     * @param startDate 시작 날짜 (YYYY-MM-DD)
     * @param endDate   종료 날짜 (YYYY-MM-DD)
     * @return 출석 이력 리스트
     */
    @GetMapping("/history")
    public BaseResponse<List<AttendanceHistoryResponse>> getAttendanceHistory(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        UUID userId = getUserId(user);

        List<AttendanceHistoryResponse> response = attendanceService.getAttendanceHistory(
                userId, startDate, endDate);

        return BaseResponse.success(response);
    }
}
