package com.liverary.backend.board.controller;

import com.liverary.backend.board.dto.request.BoardCreateRequest;
import com.liverary.backend.board.dto.response.BoardCreateResponse;
import com.liverary.backend.board.service.BoardService;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

}
