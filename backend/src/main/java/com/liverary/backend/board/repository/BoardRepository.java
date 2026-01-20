package com.liverary.backend.board.repository;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Type;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * 게시글 데이터 접근 계층(Repository) 인터페이스입니다.
 */
public interface BoardRepository extends JpaRepository<Board, UUID> {
    // 게시글 카테고리별 목록 조회
    @EntityGraph(attributePaths = "user")
    Page<Board> findByTypeOrderByCreatedAtDesc(Type type, Pageable pageable);
}
