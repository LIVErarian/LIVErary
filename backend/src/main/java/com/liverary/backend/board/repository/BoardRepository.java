package com.liverary.backend.board.repository;

import com.liverary.backend.board.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * 게시글 데이터 접근 계층(Repository) 인터페이스입니다.
 */
public interface BoardRepository extends JpaRepository<Board, UUID> {
}
