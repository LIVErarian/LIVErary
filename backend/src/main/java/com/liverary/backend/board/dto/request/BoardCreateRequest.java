package com.liverary.backend.board.dto.request;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Status;
import com.liverary.backend.board.domain.Type;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 게시글 생성 요청 DTO 클래스입니다.
 */
@Getter
@NoArgsConstructor
public class BoardCreateRequest {

    @NotBlank(message = "제목을 입력해 주세요.")
    private String title;   // 제목

    @NotBlank(message = "내용을 입력해 주세요.")
    private String content; // 내용

    @NotNull(message = "게시판 종류를 선택해 주세요.")
    private Type type;      // 게시판 종류

    private String imageUrl;// 이미지 URL

    /**
     * DTO를 Board 엔티티로 변환합니다.
     *
     * @param userId 작성자의 고유 ID (UUID)
     * @return 생성된 Board 엔티티 객체
     */
    public Board toEntity(UUID userId) {
        Type type = this.type;

        // 문의글(INQUIRY)이면 -> PENDING (답변 대기)
        // 그 외(NOTICE, PROMOTION)면 -> POSTED (게시됨)
        Status initialStatus = (type == Type.INQUIRY)
                ? Status.PENDING : Status.POSTED;

        return Board.builder()
                .userId(userId)
                .title(this.title)
                .content(this.content)
                .type(this.type)
                .status(initialStatus)
                .imageUrl(this.imageUrl)
                .build();
    }
}
