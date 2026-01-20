package com.liverary.backend.user.repository;

import com.liverary.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * User 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    // 이메일을 가진 사용자가 이미 존재하는지 확인
    boolean existsByEmail(String email);

}
