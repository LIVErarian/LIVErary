package com.liverary.backend.board.service;


import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Type;
import com.liverary.backend.board.dto.request.BoardCreateRequest;
import com.liverary.backend.board.dto.request.BoardUpdateRequest;
import com.liverary.backend.board.dto.response.BoardCreateResponse;
import com.liverary.backend.board.dto.response.BoardDetailResponse;
import com.liverary.backend.board.dto.response.BoardListResponse;
import com.liverary.backend.board.dto.response.BoardUpdateResponse;
import com.liverary.backend.board.repository.BoardRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.review.repository.ReviewRepository;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.repository.RoomRepository;
import com.liverary.backend.room.repository.RoomReservationRepository;
import com.liverary.backend.user.domain.Role;
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
    private final ReviewRepository reviewRepository;
    private final RoomReservationRepository roomReservationRepository;
    private final RoomRepository roomRepository;

    /**
     * 게시글 생성 로직 수행
     *
     * @param userId  게시글을 작성하는 사용자의 고유 ID (UUID)
     * @param request 게시글 생성에 필요한 요청 데이터 DTO
     * @return 생성된 게시글의 식별자(ID)를 포함한 응답 DTO
     */
    @Transactional
    public BoardCreateResponse createBoard(UUID userId, BoardCreateRequest request) {
        // 작성자 조회 (공통)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 변수 초기화 (홍보 게시판)
        Room room = null;

        // 홍보 게시판
        if (request.getType() == Type.PROMOTION) {
            // 방 정보 체크
            if (request.getRoomId() == null) {
                throw new BaseException(ErrorCode.ROOM_INFO_REQUIRED);
            }

            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));
        }

        // 공지 게시판
        else if (request.getType() == Type.NOTICE) {
            // 관리자 권한 체크
            if(user.getRole() != Role.ADMIN) {
                throw new BaseException(ErrorCode.INSUFFICIENT_PRIVILEGES);
            }
        }

        Board board = request.toEntity(user, room);
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
                .orElseThrow(() -> new BaseException(ErrorCode.BOARD_NOT_FOUND));

        // 변수 초기화 (홍보 게시판)
        Room room = null;
        int currentCount = 0;

        // 홍보 게시판
        if (board.getType() == Type.PROMOTION) {

            room = board.getRoom();

            currentCount = (int) roomReservationRepository.countByRoom(room);
        }

        return BoardDetailResponse.from(board, room, currentCount);
    }

    /**
     * 조건에 맞는 게시글 목록을 페이징하여 조회
     * 요청받은 keyword(검색어)를 제목에 포함하거나 코드와 일치하는 게시글을 검색합니다.
     *
     * @param type     조회할 게시판 카테고리 (필수)
     * @param keyword  검색어 (제목)
     * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬 방식)
     * @return 페이징된 게시글 목록 응답 DTO
     */
    @Transactional(readOnly = true)
    public Page<BoardListResponse> getBoardList(Type type, String keyword, Pageable pageable) {
        Page<Board> boardPage;

        // keyword와 Type에 따라 검색 또는 조회
        if (keyword != null && !keyword.isBlank()) {
            // keyword가 있는 경우 게시글 제목 검색
            boardPage = boardRepository.findByTypeAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(type, keyword, pageable);
        } else {
            boardPage = boardRepository.findByTypeOrderByCreatedAtDesc(type, pageable);
        }

        return boardPage.map(BoardListResponse::from);
    }

    /**
     * 게시글 수정
     *
     * @param userId  수정을 요청한 사용자의 ID
     * @param boardId 수정할 게시글의 ID
     * @param request 수정할 내용이 담긴 DTO
     * @return 수정된 게시글 응답 DTO
     * @throws BaseException 게시글이 없거나(404), 작성자가 아닌 경우(403)
     */
    @Transactional
    public BoardUpdateResponse updateBoard(UUID userId, UUID boardId, BoardUpdateRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BaseException(ErrorCode.BOARD_NOT_FOUND));

        // 작성자 본인 확인
        validateOwner(userId, board);

        Room room = null;

        // 방 정보 유효성 검증
        if(board.getType() == Type.PROMOTION) {
            if(request.getRoomId() == null) {
                throw new BaseException(ErrorCode.ROOM_INFO_REQUIRED);
            }

            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));
        }

        // 업데이트 실행
        board.update(request.getTitle(), request.getContent(), room);

        return BoardUpdateResponse.from(board);
    }

    /**
     * 게시글 삭제
     *
     * @param userId  삭제를 요청한 사용자의 ID
     * @param boardId 삭제할 게시글의 ID
     * @throws BaseException 게시글이 없거나(404), 작성자가 아닌 경우(403)
     */
    @Transactional
    public void deleteBoard(UUID userId, UUID boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BaseException(ErrorCode.BOARD_NOT_FOUND));

        // 작성자 본인 확인
        validateOwner(userId, board);

        // 댓글 지우기
        reviewRepository.deleteReviewsByBoardId(boardId);

        boardRepository.delete(board);
    }

    /**
     * 게시글 작성자와 요청자가 일치하는지 검증
     *
     * @param userId 요청한 사용자의 ID
     * @param board  대상 게시글 엔티티
     * @throws BaseException 작성자가 아닐 경우 NOT_BOARD_OWNER(403) 예외 발생
     */
    private void validateOwner(UUID userId, Board board) {
        if (!board.getUser().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.NOT_BOARD_OWNER);
        }
    }
}
