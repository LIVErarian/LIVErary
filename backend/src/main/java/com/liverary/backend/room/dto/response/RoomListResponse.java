package com.liverary.backend.room.dto.response;

import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomStatus;
import com.liverary.backend.room.domain.RoomType;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * 방 목록 조회 시 반환되는 응답 DTO 클래스입니다.
 */
@Getter
public class RoomListResponse {
    private UUID roomId;
    private String title;
    private RoomType roomType;
    private AccessType accessType;
    private RoomStatus status;
    private String categoryName;
    private Integer currentCount;
    private Integer maxUser;

    @Builder
    public RoomListResponse(UUID roomId, String title, RoomType roomType, AccessType accessType, RoomStatus status, String categoryName, Integer currentCount, Integer maxUser) {
        this.roomId = roomId;
        this.title = title;
        this.roomType = roomType;
        this.accessType = accessType;
        this.status = status;
        this.categoryName = categoryName;
        this.currentCount = currentCount;
        this.maxUser = maxUser;
    }

    /**
     * Room 엔티티를 기반으로 목록 조회용 응답 DTO를 생성합니다.
     *
     * <p>엔티티에서 방의 기본 정보(ID, 제목, 타입, 상태, 공개 여부)와
     * 카테고리 이름, 현재 및 최대 인원수 정보를 추출하여 응답 객체로 변환합니다.</p>
     *
     * @param room 변환할 원본 Room 엔티티
     * @return 방 목록 조회에 필요한 정보를 담은 {@link RoomListResponse} 객체
     */
    public static RoomListResponse from(Room room) {
        return RoomListResponse.builder()
                .roomId(room.getRoomId())
                .title(room.getTitle())
                .roomType(room.getRoomType())
                .accessType(room.getAccessType())
                .status(room.getStatus())
                .categoryName(room.getCategory().getName())
                .currentCount(room.getCurrentCount())
                .maxUser(room.getMaxUser())
                .build();
    }
}