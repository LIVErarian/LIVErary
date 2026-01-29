package com.liverary.backend.friend.domain;

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
    public Friend(User sender, User receiver) {
        this.sender = sender;
        this.receiver = receiver;
        this.status = FriendStatus.PENDING; // 최초 저장 시 대기 상태
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
     * 친구 요청 거절 시 상태 변경
     */
    public void reject() {
        this.status = FriendStatus.REJECTED;
        this.updatedAt = LocalDateTime.now();
    }

}