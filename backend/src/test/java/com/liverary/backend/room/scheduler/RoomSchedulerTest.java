package com.liverary.backend.room.scheduler;

import static org.assertj.core.api.Assertions.assertThat;

import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.HistoryStatus;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomHistory;
import com.liverary.backend.room.domain.RoomStatus;
import com.liverary.backend.room.domain.RoomType;
import com.liverary.backend.room.repository.RoomHistoryRepository;
import com.liverary.backend.room.repository.RoomRepository;
import com.liverary.backend.room.service.RoomService;
import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;

import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * 예약 방 스케줄러 테스트
 *
 * 예약 방의 시작(startAt)/종료(endAt) 시각에 맞춰서 방의 상태를 변경하거나 삭제한다.
 */
@SpringBootTest
@Transactional
@ActiveProfiles("test")
class RoomSchedulerTest {

    @Autowired private RoomService roomService;
    @Autowired private RoomRepository roomRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoomHistoryRepository roomHistoryRepository;

    // 편의를 위한 유저 생성 메서드
    private User createUser(String name) {
        return userRepository.save(User.builder()
                .nickname(name).email(name + "@gmail.com")
                .password("Abcd1234@").role(Role.USER).build());
    }

    // 편의를 위한 방 생성 메서드
    private Room createRoom(String title, User host, RoomStatus status, LocalDateTime start, LocalDateTime end) {
        return roomRepository.save(Room.builder()
                .title(title).creator(host)
                .roomType(RoomType.TALK).accessType(AccessType.PUBLIC).maxUser(10)
                .status(status).startAt(start).endAt(end)
                .build());
    }

    @Test
    @DisplayName("1. [자동 시작] 시작 시간이 10분 이내로 남은 방은 LIVE로 변경된다.")
    void autoStartScheduledRooms_test() {
        // Given
        User host = createUser("host1");

        // 대상: 시작 9분 남음 (SCHEDULED -> LIVE 되어야 함)
        Room targetRoom = createRoom("곧 시작할 방", host, RoomStatus.SCHEDULED,
                LocalDateTime.now().plusMinutes(9), LocalDateTime.now().plusHours(1));

        // 비대상: 시작 20분 남음 (SCHEDULED 유지)
        Room notTargetRoom = createRoom("나중에 할 방", host, RoomStatus.SCHEDULED,
                LocalDateTime.now().plusMinutes(20), LocalDateTime.now().plusHours(1));

        // When
        roomService.autoStartScheduledRooms();

        // Then
        Room resultTarget = roomRepository.findById(targetRoom.getRoomId()).orElseThrow();
        Room resultNotTarget = roomRepository.findById(notTargetRoom.getRoomId()).orElseThrow();

        assertThat(resultTarget.getStatus()).isEqualTo(RoomStatus.LIVE);
        assertThat(resultNotTarget.getStatus()).isEqualTo(RoomStatus.SCHEDULED);
    }

    @Test
    @DisplayName("2. [노쇼 종료] 시작한 지 10분이 지났는데 인원이 0명이면 FINISHED 처리한다.")
    void autoCloseNoShowRooms_test() {
        // Given
        User host = createUser("host2");

        // 대상: 시작한 지 15분 지남 & 참여자 없음 (LIVE -> FINISHED)
        Room noShowRoom = createRoom("노쇼 방", host, RoomStatus.LIVE,
                LocalDateTime.now().minusMinutes(15), LocalDateTime.now().plusHours(1));

        // 비대상 1: 시작한 지 5분 지남 (아직 10분 안 됨)
        Room justStartedRoom = createRoom("방금 시작한 방", host, RoomStatus.LIVE,
                LocalDateTime.now().minusMinutes(5), LocalDateTime.now().plusHours(1));

        // 비대상 2: 시간은 지났는데 사람이 있음
        Room activeRoom = createRoom("사람 있는 방", host, RoomStatus.LIVE,
                LocalDateTime.now().minusMinutes(15), LocalDateTime.now().plusHours(1));
        roomHistoryRepository.save(RoomHistory.builder().room(activeRoom).user(host).build());
        activeRoom.increaseCurrentCount();

        // When
        roomService.autoCloseNoShowRooms();

        // Then
        assertThat(roomRepository.findById(noShowRoom.getRoomId()).get().getStatus()).isEqualTo(RoomStatus.FINISHED);
        assertThat(roomRepository.findById(justStartedRoom.getRoomId()).get().getStatus()).isEqualTo(RoomStatus.LIVE);
        assertThat(roomRepository.findById(activeRoom.getRoomId()).get().getStatus()).isEqualTo(RoomStatus.LIVE);
    }

    @Test
    @DisplayName("3. [방 종료] 종료 시간이 지난 방은 FINISHED 되고, 유저는 LEFT 처리된다.")
    void autoCloseFinishedRooms_test() {
        // Given
        User user = createUser("user1");
        User host = createUser("host3");

        // [대상] 종료 시간이 1분 지남
        Room finishedRoom = createRoom("끝난 방", host, RoomStatus.LIVE,
                LocalDateTime.now().minusHours(1), LocalDateTime.now().minusMinutes(1));

        // 유저 참여 (JOINED)
        RoomHistory history = roomHistoryRepository.save(RoomHistory.builder().room(finishedRoom).user(user).build());

        // When
        roomService.autoCloseFinishedRooms();

        // Then
        // 1. 방 상태 확인
        Room resultRoom = roomRepository.findById(finishedRoom.getRoomId()).orElseThrow();
        assertThat(resultRoom.getStatus()).isEqualTo(RoomStatus.FINISHED);

        // 2. 유저 퇴장 확인
        RoomHistory resultHistory = roomHistoryRepository.findById(history.getHistoryId()).orElseThrow();
        assertThat(resultHistory.getStatus()).isEqualTo(HistoryStatus.LEFT);
        assertThat(resultHistory.getLeftAt()).isNotNull();
    }
}