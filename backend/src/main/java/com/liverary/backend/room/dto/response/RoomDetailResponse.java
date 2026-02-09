package com.liverary.backend.room.dto.response;

import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomStatus;
import com.liverary.backend.room.domain.RoomType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 방 상세 정보 조회 시 반환되는 응답 DTO 클래스입니다.
 */
@Getter
public class RoomDetailResponse {
    private UUID roomId;
    private UUID hostId;
    private String title;
    private RoomType roomType;
    private AccessType accessType;
    private RoomStatus status;
    private String categoryName;
    private Integer currentCount;
    private Integer maxUser;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    // 책 정보 (없을 수도 있음)
    private String bookTitle;
    private String bookAuthor;
    private String bookCoverUrl;

    @Builder
    public RoomDetailResponse(UUID roomId, UUID hostId, String title, RoomType roomType, AccessType accessType, RoomStatus status, String categoryName, Integer currentCount, Integer maxUser, LocalDateTime startAt, LocalDateTime endAt, String bookTitle, String bookAuthor, String bookCoverUrl) {
        this.roomId = roomId;
        this.hostId = hostId;
        this.title = title;
        this.roomType = roomType;
        this.accessType = accessType;
        this.status = status;
        this.categoryName = categoryName;
        this.currentCount = currentCount;
        this.maxUser = maxUser;
        this.startAt = startAt;
        this.endAt = endAt;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
        this.bookCoverUrl = bookCoverUrl;
    }

    /**
     * Room 엔티티를 상세 조회용 응답 DTO로 변환합니다. (예약자 수 포함)
     *
     * <p>방의 기본 정보(ID, 제목, 타입, 상태 등)를 매핑하며,
     * 방에 연결된 책 정보(Book)가 존재할 경우 해당 정보(제목, 저자, 커버 이미지)도 함께 포함합니다.
     * 책 정보가 없는 경우, 관련 필드는 {@code null}로 설정됩니다.</p>
     *
     * @param room 변환할 원본 Room 엔티티
     * @param count 방의 현재 인원 또는 예약자 수
     * @return 방의 상세 정보와 (존재 시) 책 정보를 포함한 {@link RoomDetailResponse} 객체
     */
    public static RoomDetailResponse from(Room room, Number count) {
        // 책 정보가 있는 경우와 없는 경우 처리
        String bTitle = (room.getBook() != null) ? room.getBook().getTitle() : null;
        String bAuthor = (room.getBook() != null) ? room.getBook().getAuthor() : null;
        String bCover = (room.getBook() != null) ? room.getBook().getCoverUrl() : null;

        return RoomDetailResponse.builder()
                .roomId(room.getRoomId())
                .hostId(room.getCreator().getUserId())
                .title(room.getTitle())
                .roomType(room.getRoomType())
                .accessType(room.getAccessType())
                .status(room.getStatus())
                .categoryName(room.getCategory().getName())
                .currentCount(count.intValue())
                .maxUser(room.getMaxUser())
                .startAt(room.getStartAt())
                .endAt(room.getEndAt())
                .bookTitle(bTitle)
                .bookAuthor(bAuthor)
                .bookCoverUrl(bCover)
                .build();
    }

    /**
     * Room 엔티티를 상세 조회용 응답 DTO로 변환합니다.
     *
     * <p>방의 기본 정보(ID, 제목, 타입, 상태 등)를 매핑하며,
     * 방에 연결된 책 정보(Book)가 존재할 경우 해당 정보(제목, 저자, 커버 이미지)도 함께 포함합니다.
     * 책 정보가 없는 경우, 관련 필드는 {@code null}로 설정됩니다.</p>
     *
     * @param room 변환할 원본 Room 엔티티
     * @return 방의 상세 정보와 (존재 시) 책 정보를 포함한 {@link RoomDetailResponse} 객체
     */
    public static RoomDetailResponse from(Room room) {
        return from(room, room.getCurrentCount());
    }
}
