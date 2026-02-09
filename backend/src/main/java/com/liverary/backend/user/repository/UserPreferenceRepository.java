package com.liverary.backend.user.repository;

import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.domain.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {

    // 유저로 유저 선호 카테고리 리스트 조회
    List<UserPreference> findByUser(User user);

}