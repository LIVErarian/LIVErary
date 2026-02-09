package com.liverary.backend.attendance.domain;

import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 출석 기록 엔티티
 */
@Entity
@Getter
@Table(name = "ATTENDANCE", uniqueConstraints = {
        @UniqueConstraint(name = "uk_attendance_user_type_date", columnNames = { "user_id", "attendance_type",
                "attended_at" })
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attendance_id")
    private UUID attendanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_type", nullable = false)
    private AttendanceType attendanceType;

    @Column(name = "attended_at", nullable = false)
    private LocalDate attendedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Attendance 엔티티 생성을 위한 빌더 패턴 생성자
     *
     * @param user           출석한 사용자
     * @param attendanceType 출석 타입 (DAILY / READING)
     * @param attendedAt     출석 날짜
     */
    @Builder
    public Attendance(User user, AttendanceType attendanceType, LocalDate attendedAt) {
        this.user = user;
        this.attendanceType = attendanceType;
        this.attendedAt = attendedAt != null ? attendedAt : LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }
}
