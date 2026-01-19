package com.liverary.backend.room.domain;

import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 유저의 방 참여 이력을 관리하는 엔티티입니다.
 */
@Entity
@Getter
@Table(name = "room_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoomHistory {
    // 방 참여 이력의 고유 식별자 (UUID)
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "history_id")
    private UUID historyId;

    // 방 정보 (FK), N:1 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // 참여한 유저의 ID (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 참여한 방에서의 사용자 역할
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomRole role;

    // 사용자의 방 출입 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HistoryStatus status;

    // 입장 시각
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    // 퇴장 시각
    private LocalDateTime leftAt;

    /**
     * RoomHistory 엔티티 생성을 위한 빌더 패턴 생성자
     *
     * @param room 참여한 방의 정보
     * @param user 참여자 정보
     * @param role 참여자의 역할 (기본값: GUEST)
     */
    @Builder
    public RoomHistory(Room room, User user, RoomRole role) {
        this.room = room;
        this.user = user;
        this.role = (role != null) ? role : RoomRole.GUEST;
        this.status = HistoryStatus.JOINED;
        this.joinedAt = LocalDateTime.now();
    }

    /**
     * 퇴장 처리를 위한 비즈니스 로직입니다.
     *
     * 상태를 LEFT로 변경하고 퇴장 시간을 현재 시간으로 기록합니다.
     */
    public void leave() {
        this.status = HistoryStatus.LEFT;
        this.leftAt = LocalDateTime.now();
    }
}