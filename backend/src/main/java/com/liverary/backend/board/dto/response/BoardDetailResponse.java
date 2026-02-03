package com.liverary.backend.board.dto.response;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Status;
import com.liverary.backend.board.domain.Type;
import com.liverary.backend.room.domain.Room;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 게시글 상세 조회 시 반환되는 응답 DTO 클래스
 */
@Getter
@Builder
public class BoardDetailResponse {

    private UUID boardId;
    private String nickname;
    private String title;
    private String content;
    private Type type;
    private Status status;
    private LocalDateTime createdAt;

    private RoomDetailInfo roomDetail;

    // PROMOTION 게시판이 아닐 경우 값이 없을 수 있음
    @Getter
    @Builder
    public static class RoomDetailInfo {
        private UUID roomId;
        private String title;
        private String category;
        private Integer currentMembers;
        private Integer maxMembers;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private boolean isJoined;

        private String bookTitle;
        private String bookAuthor;
        private String bookCoverUrl;
    }

    /**
     * Board 엔티티를 BoardDetailResponse DTO로 변환
     *
     * @param board 변환할 Board 엔티티
     * @return 변환된 상세 응답 DTO
     */
    public static BoardDetailResponse from(Board board, Room room, Integer currentCount, boolean isJoined) {

        var builder = BoardDetailResponse.builder()
                .boardId(board.getBoardId())
                .nickname(board.getUser().getNickname())
                .title(board.getTitle())
                .content(board.getContent())
                .type(board.getType())
                .status(board.getStatus())
                .createdAt(board.getCreatedAt());

        if (board.getType() == Type.PROMOTION && room != null) {

            var roomBuilder = RoomDetailInfo.builder()
                    .roomId(room.getRoomId())
                    .title(room.getTitle())
                    .currentMembers(currentCount)
                    .maxMembers(room.getMaxUser())
                    .startTime(room.getStartAt())
                    .endTime(room.getEndAt())
                    .isJoined(isJoined);

            if (room.getCategory() != null) {
                roomBuilder.category(room.getCategory().getName());
            }

            if (room.getBook() != null) {
                roomBuilder.bookTitle(room.getBook().getTitle())
                        .bookAuthor(room.getBook().getAuthor())
                        .bookCoverUrl(room.getBook().getCoverUrl());
            }

            builder.roomDetail(roomBuilder.build());
        }

        return builder.build();
    }
}
