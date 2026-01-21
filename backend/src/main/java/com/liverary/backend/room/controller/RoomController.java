package com.liverary.backend.room.controller;

import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.room.dto.request.JoinRoomRequest;
import com.liverary.backend.room.dto.request.RoomCreateRequest;
import com.liverary.backend.room.dto.response.JoinRoomResponse;
import com.liverary.backend.room.dto.response.RoomCreateResponse;
import com.liverary.backend.room.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Room 도메인의 API 요청을 처리하는 컨트롤러 클래스입니다.
 *
 * <p>방 생성, 조회, 참여 등 클라이언트의 요청을 받아
 * 서비스 계층으로 전달하고, 결과를 공통 응답 포맷으로 반환합니다.</p>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/room")
public class RoomController {

    private final RoomService roomService;

    /**
     * 새로운 방(Room)을 생성합니다.
     *
     * <p>요청 본문의 유효성을 검증(@Valid)한 후,
     * 인증된 사용자의 식별자(UUID)를 추출하여 방 생성 서비스를 호출합니다.</p>
     *
     * @param user    Spring Security를 통해 인증된 사용자 정보
     * @param request 방 생성에 필요한 제목, 유형, 인원 등의 정보를 담은 요청 DTO
     * @return 생성된 방의 식별자와 초대 코드를 포함한 성공 응답 객체 (BaseResponse)
     */
    @PostMapping
    public BaseResponse<RoomCreateResponse> createRoom(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody RoomCreateRequest request
    ) {
        UUID userId = UUID.fromString(user.getUsername());

        RoomCreateResponse response = roomService.createRoom(userId, request);

        return BaseResponse.success(response);
    }

    /**
     * 특정 방에 참여(입장) 요청을 처리합니다.
     *
     * <p>인증된 사용자의 정보를 기반으로 방 참여를 수행합니다.
     * PRIVATE 방의 경우 요청 본문에 초대 코드가 포함되어야 하며,
     * PUBLIC 방의 경우 본문 없이 요청할 수 있습니다.</p>
     *
     * @param roomId  참여하려는 방의 고유 식별자 (URL Path)
     * @param user    Spring Security를 통해 인증된 사용자 객체
     * @param request 초대 코드를 포함한 요청 DTO (PRIVATE 방일 경우 필수)
     * @return 방 참여 성공 시 생성된 참여 이력 ID(historyId)와 방 ID를 포함한 공통 응답 객체
     */
    @PostMapping("/{roomId}/join")
    public BaseResponse<JoinRoomResponse> joinRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails user,
            @RequestBody(required = false) JoinRoomRequest request
    ) {
        UUID userId = UUID.fromString(user.getUsername());

        // 비밀번호 없는 방은 빈 객체 처리
        if (request == null) {
            request = new JoinRoomRequest();
        }

        JoinRoomResponse response = roomService.joinRoom(roomId, userId, request);

        return BaseResponse.success(response);
    }
}
