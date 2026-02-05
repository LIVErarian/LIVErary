package com.liverary.backend.room.controller;

import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.RoomType;
import com.liverary.backend.room.dto.request.*;
import com.liverary.backend.room.dto.response.*;
import com.liverary.backend.room.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Room 도메인의 API 요청을 처리하는 컨트롤러 클래스입니다.
 *
 * <p>방 생성, 조회, 참여 등 클라이언트의 요청을 받아
 * 서비스 계층으로 전달하고, 결과를 공통 응답 포맷으로 반환합니다.</p>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/room")
public class RoomController {

    private final RoomService roomService;

    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

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

        UUID userId = getUserId(user);
        RoomCreateResponse response = roomService.createRoom(userId, request);
        return BaseResponse.success(response);
    }


    /**
     * 사용자에게 추천 방 목록을 제공합니다.
     *
     * <p>카테고리 필터가 있을 경우 해당 카테고리의 LIVE 방을 우선 조회하며,
     * 없을 경우 전체 LIVE 방 중 최신 시작 시간 순으로 반환합니다.</p>
     *
     * @param user       Spring Security를 통해 인증된 사용자 정보
     * @param categoryId 추천 기준이 되는 카테고리 ID (선택)
     * @return 추천 방 목록을 포함한 공통 응답 객체
     */
    @GetMapping("/recommend")
    public BaseResponse<List<RoomListResponse>> getRecommendRooms(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) UUID categoryId
    ){
        UUID userId = getUserId(user);

        List<RoomListResponse> responses = roomService.getRecommendRooms(userId, categoryId, 3);
        return BaseResponse.success(responses);
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
     * @return 방 참여 성공 시 방 ID를 포함한 공통 응답 객체
     */
    @PostMapping("/{roomId}/join")
    public BaseResponse<JoinRoomResponse> joinRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails user,
            @RequestBody(required = false) JoinRoomRequest request
    ) {
        UUID userId = getUserId(user);

        // 비밀번호 없는 방은 빈 객체 처리
        if (request == null) {
            request = new JoinRoomRequest();
        }

        JoinRoomResponse response = roomService.joinRoom(roomId, userId, request);

        return BaseResponse.success(response);
    }

    /**
     * 특정 방에서의 퇴장 요청을 처리합니다.
     *
     * <p>참여 이력 업데이트(LEFT) 및 현재 인원수 감소 처리를 수행합니다. 
     * 남은 인원이 없을 경우 방이 종료됩니다.</p>
     *
     * @param roomId 퇴장하려는 방의 고유 식별자 (URL Path)
     * @param user   Spring Security를 통해 인증된 사용자 객체
     * @return 공통 응답 객체
     */
    @PostMapping("/{roomId}/leave")
    public BaseResponse<Void> leaveRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails user
    ) {
        UUID userId = getUserId(user);

        roomService.leaveRoom(roomId, userId);

        return BaseResponse.success();
    }

    /**
     * 현재 진행 중인 독서 모임(TALK) 목록을 조회하거나 검색합니다.
     *
     * <p>검색어(keyword)가 존재할 경우 제목으로 검색을 수행합니다.
     * 쿼리 파라미터로 카테고리, 공개/비공개 여부를 필터링할 수 있으며, 지정하지 않을 경우 전체 목록을 조회합니다.</p>
     *
     * @param categoryId 카테고리
     * @param accessType 공개/비공개
     * @param keyword 검색할 키워드.
     * @param pageable 페이징 정보 (page, size, sort). 기본값: 생성일(createdAt) 기준 내림차순, 페이지당 10개
     * @return 필터링 및 페이징 처리된 방 목록({@link RoomListResponse})을 포함한 공통 응답 객체
     */
    @GetMapping("/live")
    public BaseResponse<Page<RoomListResponse>> getLiveRooms(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) AccessType accessType,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "startAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<RoomListResponse> response = roomService.getLiveRooms(categoryId, accessType, keyword, pageable);
        return BaseResponse.success(response);
    }

    /**
     * 예약된 독서 모임(TALK) 목록을 조회하거나 검색합니다.
     *
     * <p>검색어(keyword)가 존재할 경우 제목으로 검색을 수행합니다.
     * 쿼리 파라미터로 카테고리를 필터링할 수 있으며, 지정하지 않을 경우 전체 목록을 조회합니다.</p>
     *
     * @param categoryId 카테고리
     * @param keyword 검색할 키워드.
     * @param pageable 페이징 정보 (page, size, sort). 기본값: 생성일(createdAt) 기준 내림차순, 페이지당 10개
     * @return 필터링 및 페이징 처리된 방 목록({@link RoomListResponse})을 포함한 공통 응답 객체
     */
    @GetMapping("/reservation")
    public BaseResponse<Page<RoomListResponse>> getScheduledRooms(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "startAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<RoomListResponse> response = roomService.getScheduledRooms(categoryId, keyword, pageable);
        return BaseResponse.success(response);
    }

    /**
     * 입장 코드로 방을 검색합니다.
     *
     * <p>코드는 정확히 일치해야 합니다.
     * 검색 결과는 단건(방 하나)으로 반환합니다.</p>
     *
     * @param code 사용자가 입력한 코드
     * @return 입장 코드와 일치하는 방 객체
     */
    @GetMapping("/search")
    public BaseResponse<RoomListResponse> searchRoomByCode(
            @RequestParam String code
    ) {
        RoomListResponse response = roomService.searchRoomByCode(code);
        return BaseResponse.success(response);
    }


    /**
     * 특정 방의 상세 정보를 조회합니다.
     *
     * @param roomId 조회할 방의 고유 식별자 (URL Path)
     * @return 방 상세 정보 DTO
     */
    @GetMapping("/{roomId}")
    public BaseResponse<RoomDetailResponse> getRoomDetail(
            @PathVariable UUID roomId
    ) {
        RoomDetailResponse response = roomService.getRoomDetail(roomId);
        return BaseResponse.success(response);
    }

    /**
     * 예약 방 정보를 수정합니다.
     *
     * @param user Spring Security를 통해 인증된 사용자 정보
     * @param roomId 수정할 방의 고유 식별자 (URL Path)
     * @param request 예약 방 수정 요청 정보가 담긴 DTO
     * @return 수정한 방의 식별자와 초대 코드를 포함한 성공 응답 객체 (BaseResponse)
     */
    @PatchMapping("/reservation/{roomId}")
    public BaseResponse<UpdateReservationResponse> updateReservation(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody UpdateReservationRequest request
    ) {
        UUID userId = getUserId(user);

        UpdateReservationResponse response = roomService.updateReservation(roomId, userId, request);

        return BaseResponse.success(response);
    }

    /**
     * 방 예약을 취소(삭제)합니다.
     *
     * @param roomId 예약 취소할 방의 고유 식별자 (URL Path)
     * @param user Spring Security를 통해 인증된 사용자 정보
     * @return 공통 응답 객체
     */
    @DeleteMapping("/reservation/{roomId}")
    public BaseResponse<Void> deleteReservation(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails user
    ) {
        UUID userId = getUserId(user);
        roomService.deleteReservation(userId, roomId);

        return BaseResponse.success();
    }

    /**
     * 예약 방에 참여 신청합니다.
     *
     * @param roomId 참여 신청할 방의 고유 식별자 (URL Path)
     * @param user Spring Security를 통해 인증된 사용자 정보
     * @return 참여 코드를 포함한 공통 응답 객체
     */
    @PostMapping("/reservation/{roomId}/apply")
    public BaseResponse<ApplyReservationResponse> applyReservation(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails user
    ) {
        UUID userId = getUserId(user);
        ApplyReservationResponse response = roomService.applyReservation(userId, roomId);

        return BaseResponse.success(response);
    }

    /**
     * 예약 참여 신청을 취소합니다.
     *
     * @param roomId 참여 신청을 취소할 방의 고유 식별자 (URL Path)
     * @param user Spring Security를 통해 인증된 사용자 정보
     * @return 공통 응답 객체
     */
    @DeleteMapping("/reservation/{roomId}/apply")
    public BaseResponse<Void> cancelReservation(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails user
    ) {
        UUID userId = getUserId(user);
        roomService.cancelReservation(userId, roomId);

        return BaseResponse.success();
    }

    /**
     * 내가 예약(참여 신청)한 방 목록을 조회합니다.
     * 홍보 게시글 작성 시 방 선택 드롭다운에 사용됩니다.
     *
     * @param user Spring Security를 통해 인증된 사용자 정보
     * @return 방 목록을 포함한 공통 응답 객체
     */
    @GetMapping("/reservation/my")
    public BaseResponse<List<MyReservationResponse>> getMyReservations(
            @AuthenticationPrincipal UserDetails user
    ) {
        UUID userId = getUserId(user);
        List<MyReservationResponse> response = roomService.getMyReservation(userId);

        return BaseResponse.success(response);
    }
}
