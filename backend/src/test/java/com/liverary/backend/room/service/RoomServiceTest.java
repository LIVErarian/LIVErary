package com.liverary.backend.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomStatus;
import com.liverary.backend.room.domain.RoomType;
import com.liverary.backend.room.dto.request.RoomCreateRequest;
import com.liverary.backend.room.dto.response.RoomCreateResponse;
import com.liverary.backend.room.repository.RoomRepository;
import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;

import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class RoomServiceTest {

    @Autowired private RoomService roomService;
    @Autowired private RoomRepository roomRepository;
    @Autowired private UserRepository userRepository;

    // [Helper] 유저 생성
    private User createUser(String nickname, Role role) {
        return userRepository.save(User.builder()
                .nickname(nickname)
                .email(nickname + "@test.com")
                .password("password")
                .role(role)
                .build());
    }

    // [Helper] 방 직접 생성 (Repository 이용) - 수정됨: User 파라미터 추가
    private Room createRoomDirectly(User creator, String title, RoomType type, RoomStatus status, LocalDateTime start, LocalDateTime end) {
        return roomRepository.save(Room.builder()
                .title(title)
                .creator(creator) // [Fix] 방장 정보 필수 설정 (user_id not null 해결)
                .roomType(type)
                .accessType(AccessType.PUBLIC)
                .maxUser(10)
                .status(status)
                .startAt(start)
                .endAt(end)
                .build());
    }

    // [Helper] DTO 생성 (Reflection 사용)
    private RoomCreateRequest createRequest(String title, RoomType roomType, AccessType accessType, int maxUser, RoomStatus status, LocalDateTime start, LocalDateTime end) {
        RoomCreateRequest request = new RoomCreateRequest();
        ReflectionTestUtils.setField(request, "title", title);
        ReflectionTestUtils.setField(request, "roomType", roomType);
        ReflectionTestUtils.setField(request, "accessType", accessType);
        ReflectionTestUtils.setField(request, "maxUser", maxUser);
        ReflectionTestUtils.setField(request, "status", status);
        ReflectionTestUtils.setField(request, "startAt", start);
        ReflectionTestUtils.setField(request, "endAt", end);
        return request;
    }

    @Test
    @DisplayName("1. [STABLE 생성] 관리자(ADMIN)는 STABLE 타입의 방을 생성할 수 있다.")
    void createStableRoom_Admin_Success() {
        // Given
        User admin = createUser("admin_user", Role.ADMIN);

        RoomCreateRequest request = createRequest(
                "상시 운영 로비",
                RoomType.STABLE,
                AccessType.PUBLIC,
                100,
                RoomStatus.LIVE,
                LocalDateTime.now(),
                null
        );

        // When
        RoomCreateResponse response = roomService.createRoom(admin.getUserId(), request);

        // Then
        Room savedRoom = roomRepository.findById(response.getRoomId()).orElseThrow();
        assertThat(savedRoom.getRoomType()).isEqualTo(RoomType.STABLE);
        assertThat(savedRoom.getStatus()).isEqualTo(RoomStatus.LIVE);
    }

    @Test
    @DisplayName("2. [STABLE 생성 실패] 일반 유저(USER)가 STABLE 방을 생성하면 예외가 발생한다.")
    void createStableRoom_User_Fail() {
        // Given
        User user = createUser("normal_user", Role.USER);

        RoomCreateRequest request = createRequest(
                "일반 유저의 상시 방",
                RoomType.STABLE,
                AccessType.PUBLIC,
                10,
                RoomStatus.LIVE,
                LocalDateTime.now(),
                null
        );

        // When & Then
        assertThatThrownBy(() -> roomService.createRoom(user.getUserId(), request))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INSUFFICIENT_PRIVILEGES);
    }

    @Test
    @DisplayName("3. [스케줄러 제외 - 노쇼] STABLE 방은 시작 후 10분이 지나고 참여자가 0명이어도 삭제되지 않는다.")
    void autoCloseNoShowRooms_Exclude_Stable() {
        // Given
        User host = createUser("host_noshow", Role.USER); // [Fix] 방장 생성

        // Case A: 일반 방 (시작 15분 경과, 0명) -> 삭제 대상(FINISHED)
        Room normalRoom = createRoomDirectly(host, "일반 노쇼방", RoomType.TALK, RoomStatus.LIVE,
                LocalDateTime.now().minusMinutes(15), LocalDateTime.now().plusHours(1));

        // Case B: STABLE 방 (시작 15분 경과, 0명) -> 유지 대상(LIVE)
        Room stableRoom = createRoomDirectly(host, "상시 로비", RoomType.STABLE, RoomStatus.LIVE,
                LocalDateTime.now().minusMinutes(15), null);

        // When
        roomService.autoCloseNoShowRooms();

        // Then
        assertThat(roomRepository.findById(normalRoom.getRoomId()).get().getStatus())
                .isEqualTo(RoomStatus.FINISHED); // 일반 방은 종료됨

        assertThat(roomRepository.findById(stableRoom.getRoomId()).get().getStatus())
                .isEqualTo(RoomStatus.LIVE); // STABLE 방은 살아있음
    }

    @Test
    @DisplayName("4. [스케줄러 제외 - 종료 시간] STABLE 방은 종료 시간이 지나도(혹은 설정되어 있어도) 자동 종료되지 않는다.")
    void autoCloseFinishedRooms_Exclude_Stable() {
        // Given
        User host = createUser("host_finished", Role.USER); // [Fix] 방장 생성

        // Case A: 일반 방 (종료 시간 지남) -> 삭제 대상(FINISHED)
        Room normalRoom = createRoomDirectly(host, "끝난 일반방", RoomType.TALK, RoomStatus.LIVE,
                LocalDateTime.now().minusHours(2), LocalDateTime.now().minusMinutes(1));

        // Case B: STABLE 방 (종료 시간 지남 - 만약 설정되었다고 가정) -> 유지 대상(LIVE)
        Room stableRoom = createRoomDirectly(host, "시간 지난 상시방", RoomType.STABLE, RoomStatus.LIVE,
                LocalDateTime.now().minusHours(5), LocalDateTime.now().minusMinutes(1));

        // When
        roomService.autoCloseFinishedRooms();

        // Then
        assertThat(roomRepository.findById(normalRoom.getRoomId()).get().getStatus())
                .isEqualTo(RoomStatus.FINISHED); // 일반 방은 종료됨

        assertThat(roomRepository.findById(stableRoom.getRoomId()).get().getStatus())
                .isEqualTo(RoomStatus.LIVE); // STABLE 방은 살아있음
    }
}