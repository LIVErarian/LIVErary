package com.liverary.backend.friend.repository;

import com.liverary.backend.friend.domain.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Friend 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스
 */
public interface FriendRepository extends JpaRepository<Friend, UUID> {

}