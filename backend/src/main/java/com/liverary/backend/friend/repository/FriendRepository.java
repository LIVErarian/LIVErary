package com.liverary.backend.friend.repository;

import com.liverary.backend.friend.domain.Friend;
import com.liverary.backend.friend.domain.FriendStatus;
import com.liverary.backend.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

/**
 * Friend 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스
 */
public interface FriendRepository extends JpaRepository<Friend, UUID> {

    // 존재하는 친구 관계 객체 조회
    Friend findBySenderAndReceiver(User sender, User receiver);

    // 해당 상태의 관계가 존재하는지 확인
    boolean existsBySenderAndReceiverAndStatus(User sender, User receiver, FriendStatus status);

    // 내 친구 목록 조회
    @Query("SELECT f FROM Friend f WHERE (f.sender = :user OR f.receiver = :user) AND f.status = :status")
    Page<Friend> findAllFriends(@Param("user") User user, @Param("status") FriendStatus status, Pageable pageable);

    // 받은 요청 목록 조회
    Page<Friend> findAllByReceiverAndStatus(User receiver, FriendStatus status, Pageable pageable);

    // 내가 차단한 사용자 목록 조회
    Page<Friend> findAllBySenderAndStatus(User sender, FriendStatus status, Pageable pageable);

}