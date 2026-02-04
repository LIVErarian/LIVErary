package com.liverary.backend.friend.domain;

import com.liverary.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 유저 간의 친구 관계 및 요청 정보를 관리하는 엔티티
 */
@Entity
@Getter
@Table(
        name = "friend",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_requester_receiver",
                        columnNames = {"sender_id", "receiver_id"}
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "friend_id")
    private UUID friendId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender; // 요청을 보낸 유저

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;  // 요청을 받은 유저

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Friend(User sender, User receiver, FriendStatus status) {
        this.sender = sender;
        this.receiver = receiver;
        this.status = (status != null) ? status : FriendStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 친구 요청 수락 시 상태 변경
     */
    public void accept() {
        this.status = FriendStatus.ACCEPTED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 관계 상태 설정
     *
     * @param userId 조회 요청 사용자
     * @return  관계 상태
     */
    public String getRelationStatus(UUID userId) {
        // 관계 없음
        if (this.status == null) {
            return "NONE";
        }

        boolean isSender = this.sender.getUserId().equals(userId);

        // 수락된 상태인 경우
        if (this.status == FriendStatus.ACCEPTED) {
            return "FRIEND";
        }

        // 대기 중인 상태인 경우
        if (this.status == FriendStatus.PENDING) {
            return isSender ? "PENDING_SENT" : "PENDING_RECEIVED";
        }

        // 차단된 상태인 경우
        if (this.status == FriendStatus.BLOCKED) {
            // 내가 차단한 경우에만 차단 상태 전달, 상대가 나를 차단했으면 NONE으로 은폐
            return isSender ? "BLOCKED_BY_ME" : "NONE";
        }

        // 아무 관계 없음
        return "NONE";
    }

}