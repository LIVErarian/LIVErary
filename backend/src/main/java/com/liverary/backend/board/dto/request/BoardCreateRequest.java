package com.liverary.backend.board.dto.request;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Status;
import com.liverary.backend.board.domain.Type;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.user.domain.User;
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

    // 사용자가 선택한 방 ID (홍보 게시판일 때만 들어옴)
    private UUID roomId;

    private String categoryName;

    /**
     * DTO를 Board 엔티티로 변환합니다.
     *
     * @param user 작성자
     * @param room 방 정보
     * @return 생성된 Board 엔티티 객체
     */
    public Board toEntity(User user, Room room) {
        Type type = this.type;

        // 문의글(INQUIRY)이면 -> PENDING (답변 대기)
        // 그 외(NOTICE, PROMOTION)면 -> POSTED (게시됨)
        Status initialStatus = (type == Type.INQUIRY)
                ? Status.PENDING : Status.POSTED;

        var builder = Board.builder()
                .user(user)
                .title(this.title)
                .content(this.content)
                .type(this.type)
                .status(initialStatus);

        // 방 정보(Room)가 있을 때 처리
        if (room != null) {
            builder.targetRoomId(room.getRoomId())
                    .categoryName(room.getCategory().getName());

            if (room.getBook() != null) {
                builder.bookTitle(room.getBook().getTitle())
                        .bookAuthor(room.getBook().getAuthor())
                        .bookCoverUrl(room.getBook().getCoverUrl());
            }
        }

        return builder.build();
    }
}
