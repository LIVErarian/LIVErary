package com.liverary.backend.board.service;


import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.dto.request.BoardCreateRequest;
import com.liverary.backend.board.dto.response.BoardCreateResponse;
import com.liverary.backend.board.repository.BoardRepository;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 게시판 비즈니스 로직 처리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    /**
     * 게시글 생성 로직 수행
     *
     * @param userId  게시글을 작성하는 사용자의 고유 ID (UUID)
     * @param request 게시글 생성에 필요한 요청 데이터 DTO
     * @return 생성된 게시글의 식별자(ID)를 포함한 응답 DTO
     */
    @Transactional
    public BoardCreateResponse createBoard(UUID userId, BoardCreateRequest request) {
        User userRef = userRepository.getReferenceById(userId);

        Board board = request.toEntity(userRef);

        Board savedBoard = boardRepository.save(board);

        return BoardCreateResponse.from(savedBoard);
    }
}
