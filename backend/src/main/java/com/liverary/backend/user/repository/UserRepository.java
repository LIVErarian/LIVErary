package com.liverary.backend.user.repository;

import com.liverary.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * User 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface UserRepository extends JpaRepository<User, UUID> {

}
