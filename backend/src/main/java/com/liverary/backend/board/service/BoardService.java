package com.liverary.backend.board.service;


import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Type;
import com.liverary.backend.board.dto.request.BoardCreateRequest;
import com.liverary.backend.board.dto.response.BoardCreateResponse;
import com.liverary.backend.board.dto.response.BoardDetailResponse;
import com.liverary.backend.board.dto.response.BoardListResponse;
import com.liverary.backend.board.repository.BoardRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /**
     * 특정 게시글의 상세 정보 조회
     *
     * @param boardId 조회할 게시글의 고유 ID
     * @return 게시글 상세 정보를 담은 응답 DTO
     * @throws BaseException 게시글을 찾을 수 없는 경우 발생 (RESOURCE_NOT_FOUND)
     */
    @Transactional(readOnly = true)
    public BoardDetailResponse getBoardDetail(UUID boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND));

        return BoardDetailResponse.from(board);
    }

    /**
     * 조건에 맞는 게시글 목록을 페이징하여 조회
     *
     * @param type     조회할 게시판 카테고리 (필수)
     * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬 방식)
     * @return 페이징된 게시글 목록 응답 DTO
     */
    @Transactional(readOnly = true)
    public Page<BoardListResponse> getBoardList(Type type, Pageable pageable) {
        Page<Board> boardPage = boardRepository.findByTypeOrderByCreatedAtDesc(type, pageable);

        return boardPage.map(BoardListResponse::from);
    }
}
