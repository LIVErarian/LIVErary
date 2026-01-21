package com.liverary.backend.board.controller;

import com.liverary.backend.board.domain.Type;
import com.liverary.backend.board.dto.request.BoardCreateRequest;
import com.liverary.backend.board.dto.response.BoardCreateResponse;
import com.liverary.backend.board.dto.response.BoardDetailResponse;
import com.liverary.backend.board.dto.response.BoardListResponse;
import com.liverary.backend.board.service.BoardService;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 게시판 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/board")
public class BoardController {

    private final BoardService boardService;

    /**
     * 게시글 작성 API
     *
     * @param user 인증된 사용자 정보 (Spring Security 주입)
     * @param dto  게시글 생성을 위한 요청 데이터 (제목, 내용, 타입 등)
     * @return 생성된 게시글의 ID가 포함된 응답 객체
     */
    @PostMapping
    public BaseResponse<BoardCreateResponse> createBoard(@AuthenticationPrincipal User user,
                                                         @RequestBody @Valid BoardCreateRequest dto) {

        // 서비스 로직 수행
         BoardCreateResponse response = boardService.createBoard(user.getUserId(), dto);

        return BaseResponse.success(response);
    }

    /**
     * 특정 게시글의 상세 정보 조회
     *
     * @param boardId 조회할 게시글의 UUID
     * @return 게시글 상세 정보가 포함된 공통 응답 객체
     */
    @GetMapping("/{boardId}")
    public BaseResponse<BoardDetailResponse> getBoardDetails(@PathVariable UUID boardId) {

        // 서비스 로직 수행
        BoardDetailResponse response = boardService.getBoardDetail(boardId);

        return BaseResponse.success(response);
    }

    /**
     * 게시글 목록 조회
     *
     * @param type     조회할 게시판 종류 (필수)
     * @param pageable 페이징 정보 (기본값: 10개씩, 생성일 내림차순 정렬)
     * @return 페이징된 게시글 목록이 포함된 공통 응답 객체
     */
    @GetMapping
    public BaseResponse<Page<BoardListResponse>> getBoards(@RequestParam Type type,
                                                           @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
                                                           Pageable pageable) {
        Page<BoardListResponse> response = boardService.getBoardList(type, pageable);
        return BaseResponse.success(response);
    }

}
