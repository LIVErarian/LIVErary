package com.liverary.backend.room.domain;

import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 방 예약 신청 내역을 관리하는 엔티티입니다.
 */
@Entity
@Getter
@Table(
        name="room_reservation",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_room_reservation_user_room",
                        columnNames = {"user_id", "room_id"}
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoomReservation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "reservation_id")
    private UUID reservationId;

    // 방 정보 (FK), N:1 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // 참여한 유저 정보 (FK), N:1 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 예약 생성일시
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * RoomReservation 엔티티 생성을 위한 빌더 패턴 생성자
     *
     * @param user 예약을 신청한 유저
     * @param room 예약을 신청한 방
     */
    @Builder
    public RoomReservation(User user, Room room) {
        this.user = user;
        this.room = room;

        this.createdAt = LocalDateTime.now();
    }
}
