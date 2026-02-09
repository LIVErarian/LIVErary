package com.liverary.backend.board.repository;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Type;
import com.liverary.backend.room.domain.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * 게시글 데이터 접근 계층(Repository) 인터페이스입니다.
 */
public interface BoardRepository extends JpaRepository<Board, UUID> {
    // 게시글 카테고리별 목록 조회 (전체 목록)
    @EntityGraph(attributePaths = {"user", "room", "room.category"})
    Page<Board> findByTypeOrderByCreatedAtDesc(Type type, Pageable pageable);

    // 게시글 카테고리별 keyword 포함 목록 조회(대소문자 구분 없음)
    @EntityGraph(attributePaths = {"user", "room", "room.category"})
    Page<Board> findByTypeAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(Type type, String keyword, Pageable pageable);

    // 특정 방과 연결된 게시글 삭제
    void deleteByRoom(Room room);
}
