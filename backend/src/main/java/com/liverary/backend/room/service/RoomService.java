package com.liverary.backend.room.service;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.repository.BookRepository;
import com.liverary.backend.category.domain.Category;
import com.liverary.backend.category.repository.CategoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.*;
import com.liverary.backend.room.dto.request.*;
import com.liverary.backend.room.dto.response.*;
import com.liverary.backend.room.repository.RoomHistoryRepository;
import com.liverary.backend.room.repository.RoomRepository;
import com.liverary.backend.room.repository.RoomReservationRepository;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import com.liverary.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Room 도메인의 비즈니스 로직을 처리하는 서비스 클래스입니다.
 *
 * <p>방 생성, 조회, 참여 및 퇴장과 관련된 유스케이스를 담당하며,
 * 트랜잭션 경계를 정의합니다.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final RoomHistoryRepository roomHistoryRepository;
    private final UserService userService;
    private final RoomReservationRepository roomReservationRepository;

    /**
     * 새로운 방(Room)을 생성합니다.
     *
     * <p>요청에 포함된 책(Book) 정보의 유무에 따라 카테고리를 자동으로 결정합니다.
     * 책이 선택된 경우 해당 책의 카테고리를 따르며,
     * 책이 없는 경우 별도로 입력된 카테고리 정보를 사용하고,
     * 책과 카테고리를 모두 선택하지 않은 경우 '기타'로 설정합니다.</p>
     *
     * @param userId  방을 생성하는 유저의 고유 식별자(UUID)
     * @param request 방 생성 요청 정보가 담긴 DTO
     * @return 생성된 방의 식별자와 초대 코드를 포함한 응답 DTO
     * @throws BaseException 유저, 책, 또는 카테고리를 찾을 수 없거나 필수 정보가 누락된 경우 발생
     */
    @Transactional
    public RoomCreateResponse createRoom(UUID userId, RoomCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Book book = null;
        Category category;

        // 책 선택 여부에 따라 방의 카테고리 결정
        if (request.getBookId() != null) {
            // Case 1: 책을 선택한 경우
            book = bookRepository.findById(request.getBookId())
                    .orElseThrow(() -> new BaseException(ErrorCode.BOOK_NOT_FOUND));
            category = book.getCategory();
        } else if (request.getCategoryId() != null) {
            // Case 2: 책 없이 카테고리만 직접 선택한 경우
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
        } else {
            // Case 3: 둘 다 선택하지 않은 경우
            category = categoryRepository.findByName("기타")
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        Room room = Room.builder()
                .title(request.getTitle())
                .roomType(request.getRoomType())
                .accessType(request.getAccessType())
                .maxUser(request.getMaxUser())
                .creator(user)
                .book(book)
                .category(category)
                .startAt(request.getStartAt())
                .build();

        roomRepository.save(room);

        return RoomCreateResponse.from(room);
    }

    /**
     * 예약된 방(Reserved Room)을 생성합니다.
     *
     * <p>방 생성과 동시에 생성자(Host)의 예약 내역을 저장합니다.<br/>
     * 시작/종료 시간의 순서 논리 검증과
     * 생성자의 동시간대 중복 예약 여부 검증을 수행합니다.
     * </p>
     *
     * @param userId  예약 방을 생성하는 유저(Host)의 고유 식별자
     * @param request 예약 방 생성 요청 정보가 담긴 DTO (startAt, endAt 필수)
     * @return 생성된 방의 식별자와 초대 코드를 포함한 응답 DTO
     * @throws BaseException 시간 설정이 잘못되었거나, 중복된 예약이 있을 경우 발생
     */
    @Transactional
    public CreateReservationResponse createReservation(UUID userId, CreateReservationRequest request) {
        User host = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 시작 시각보다 종료 시각이 나중인지 검증
        if (request.getStartAt().isAfter(request.getEndAt()) || request.getStartAt().isEqual(request.getEndAt())) {
            throw new BaseException(ErrorCode.INVALID_TIME_RANGE);
        }

        // 동일 시간대에 중복 예약을 방지
        boolean isOverlapped = roomReservationRepository.existsOverlappingReservation(
                host, request.getStartAt(), request.getEndAt()
        );
        if (isOverlapped) {
            throw new BaseException(ErrorCode.RESERVATION_CONFLICT);
        }

        Book book = null;
        Category category;

        // 책 선택 여부에 따라 방의 카테고리 결정
        if (request.getBookId() != null) {
            // Case 1: 책을 선택한 경우
            book = bookRepository.findById(request.getBookId())
                    .orElseThrow(() -> new BaseException(ErrorCode.BOOK_NOT_FOUND));
            category = book.getCategory();
        } else if (request.getCategoryId() != null) {
            // Case 2: 책 없이 카테고리만 직접 선택한 경우
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
        } else {
            // Case 3: 둘 다 선택하지 않은 경우
            category = categoryRepository.findByName("기타")
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        Room room = Room.builder()
                .title(request.getTitle())
                .roomType(request.getRoomType())
                .accessType(request.getAccessType())
                .maxUser(request.getMaxUser())
                .creator(host)
                .book(book)
                .category(category)
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .build();

        room.confirmReservation();
        roomRepository.save(room);

        // host를 예약 신청 내역에 추가
        RoomReservation reservation = RoomReservation.builder()
                .room(room)
                .user(host)
                .build();
        roomReservationRepository.save(reservation);

        return new CreateReservationResponse(room.getRoomId(), room.getCode());
    }

    /**
     * 방의 예약 정보(제목, 시간, 정원, 책/카테고리 등)를 수정합니다.
     *
     * <p>방장(Creator)만 예약 정보를 수정할 수 있으며,
     * 방장 외에 다른 참여자가 존재하는 경우(총원 > 1), 시작 및 종료 시각을 변경할 수 없습니다.
     * 책(BookId)이 입력된 경우 해당 책의 카테고리를 따르며, 책 없이 카테고리만 입력된 경우 해당 카테고리로 변경됩니다.
     * </p>
     *
     * @param roomId 수정하려는 방의 고유 식별자(UUID)
     * @param userId 수정을 요청한 유저(방장)의 고유 식별자(UUID)
     * @param request 수정할 제목, 정원, 시간, 책/카테고리 정보가 담긴 DTO
     * @return 수정된 방의 ID와 초대 코드를 포함한 응답 객체
     * @throws BaseException 시간 설정이 잘못되었거나, 중복된 예약이 있을 경우 발생
     */
    @Transactional
    public UpdateReservationResponse updateReservation(UUID roomId, UUID userId, UpdateReservationRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 방장 권한 검증
        if (!room.getCreator().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.NOT_ROOM_CREATOR);
        }

        // 시간 변경 여부 확인
        boolean isTimeUpdate =
                (request.getStartAt() != null && !request.getStartAt().equals(room.getStartAt())) ||
                (request.getEndAt() != null && !request.getEndAt().equals(room.getEndAt()));

        if (isTimeUpdate) {
            // 방장 외에 다른 참여자가 있다면 시간 변경 불가
            long participantCount = roomReservationRepository.countByRoom(room);

            if (participantCount > 1) {
                throw new BaseException(ErrorCode.CANNOT_UPDATE_TIME);
            }

            LocalDateTime newStart = request.getStartAt() != null ? request.getStartAt() : room.getStartAt();
            LocalDateTime newEnd = request.getEndAt() != null ? request.getEndAt() : room.getEndAt();

            // 시간 유효성 검증
            if (newEnd.isBefore(newStart) || newEnd.isEqual(newStart)) {
                throw new BaseException(ErrorCode.INVALID_TIME_RANGE);
            }

            // 중복 예약 방지
            boolean isOverlapped = roomReservationRepository.existsOverlappingReservationExcludingRoom(user, newStart, newEnd, roomId);
            if (isOverlapped) {
                throw new BaseException(ErrorCode.RESERVATION_CONFLICT);
            }
        }

        // 책 및 카테고리에 따라 방의 카테고리 변경
        Book book = null;
        Category category = null;

        if (request.getBookId() != null) {
            book = bookRepository.findById(request.getBookId())
                    .orElseThrow(() -> new BaseException(ErrorCode.BOOK_NOT_FOUND));
        } else if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BaseException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        room.updateReservation(
                request.getTitle(),
                request.getMaxUser(),
                request.getStartAt(),
                request.getEndAt(),
                book,
                category
        );

        return new UpdateReservationResponse(room.getRoomId(), room.getCode());
    }

    /**
     * 예약한 방을 취소(삭제)합니다.
     *
     * <p>요청자가 방장(creator)이고,
     * 시작 시간 1시간 전일 경우 삭제할 수 있습니다.
     * 삭제 시 연관된 예약자 명단(RoomReservation)과 방(Room) 데이터를 모두 삭제합니다.</p>
     *
     * @param userId 방 삭제를 요청하는 유저의 고유 식별자(UUID)
     * @param roomId 삭제하려는 방의 고유 식별자(UUID)
     */
    @Transactional
    public void deleteReservation(UUID userId, UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 방장 권한 확인
        if (!room.getCreator().getUserId().equals(user.getUserId())) {
            throw new BaseException(ErrorCode.NOT_ROOM_CREATOR);
        }

        // 시작 1시간 전까지만 삭제 가능
        LocalDateTime deleteDeadline = room.getStartAt().minusHours(1);
        if (LocalDateTime.now().isAfter(deleteDeadline)) {
            throw new BaseException(ErrorCode.TOO_LATE_TO_CANCEL_ROOM);
        }

        // 연관된 예약 내역 전체 삭제
        roomReservationRepository.deleteAllByRoom(room);
        roomRepository.delete(room);
    }

    /**
     * 예약 전용 방에 참여를 신청합니다.
     *
     * <p>다음과 같은 유효성 검사를 수행합니다.</p>
     * <ul>
     * <li>방 존재 여부 및 상태(SCHEDULED) 확인</li>
     * <li>이미 신청한 내역이 있는지 확인 (중복 신청 방지)</li>
     * <li>정원 초과 여부 확인 (maxUser 도달 시 차단)</li>
     * <li>신청자의 기존 일정과 겹치는지 확인 (중복 일정 차단)</li>
     * </ul>
     *
     * @param userId 신청하는 유저의 ID
     * @param roomId 신청할 방의 ID
     * @throws BaseException 정원 초과(ROOM_FULL), 일정 중복(RESERVATION_CONFLICT) 등
     */
    @Transactional
    public void applyReservation(UUID userId, UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 해당 방이 예약 가능한 상태인지 확인
        if (room.getStatus() != RoomStatus.SCHEDULED) {
            throw new BaseException(ErrorCode.ROOM_NOT_RESERVABLE);
        }

        // 중복 신청 여부 확인
        boolean isAlreadyReserved = roomReservationRepository.existsByRoomAndUser(room, user);
        if (isAlreadyReserved) {
            throw new BaseException(ErrorCode.ALREADY_RESERVED);
        }

        // 정원 초과 확인 (예약자 수 기준)
        long currentReservationCount = roomReservationRepository.countByRoom(room);
        if (currentReservationCount >= room.getMaxUser()) {
            throw new BaseException(ErrorCode.ROOM_FULL);
        }

        // 신청자의 기존 일정과 중복되는지 확인
        boolean isTimeOverlapped = roomReservationRepository.existsOverlappingReservation(
                user, room.getStartAt(), room.getEndAt()
        );
        if (isTimeOverlapped) {
            throw new BaseException(ErrorCode.RESERVATION_CONFLICT);
        }

        RoomReservation reservation = RoomReservation.builder()
                .room(room)
                .user(user)
                .build();

        roomReservationRepository.save(reservation);
    }

    /**
     * 예약 방 참여 신청을 취소합니다.
     *
     * @param userId 취소 신청하는 유저의 ID
     * @param roomId 취소할 방의 ID
     * @throws BaseException 예약 내역 없음(NOT_RESERVED), 취소 가능 시간 제한(TOO_LATE_TO_CANCEL_RESERVATION) 등
     */
    @Transactional
    public void cancelReservation(UUID userId, UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        RoomReservation reservation = roomReservationRepository.findByRoomAndUser(room, user)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_RESERVED));

        // 시작 10분 전까지만 취소 가능
        LocalDateTime cancelDeadline = room.getStartAt().minusMinutes(10);
        if (LocalDateTime.now().isAfter(cancelDeadline)) {
            throw new BaseException(ErrorCode.TOO_LATE_TO_CANCEL_RESERVATION);
        }

        roomReservationRepository.delete(reservation);
    }

    /**
     * 유저가 특정 방에 참여(입장)합니다.
     *
     * <p>방 입장 전 다음과 같은 유효성 검사를 수행합니다:</p>
     * <ul>
     * <li>LIVE 상태: 즉시 입장 가능</li>
     * <li>RESERVED 상태: 시작 10분 전부터 입장 가능</li>
     * <li>공통: 중복 참여, 정원 초과, PRIVATE 방의 초대 코드 검증</li>
     * </ul>
     *
     * <p>검증이 완료되면 참여 이력(RoomHistory)을 'JOINED' 상태로 생성하고,
     * 방의 현재 인원수를 1 증가시킵니다. 참여자의 기본 역할은 'GUEST'로 설정됩니다.</p>
     *
     * @param roomId  참여하려는 방의 고유 식별자(UUID)
     * @param userId  참여를 요청한 유저의 고유 식별자(UUID)
     * @param request 초대 코드가 포함된 요청 DTO (PRIVATE 방일 경우 필수)
     * @return 방 참여 기록 ID(historyId)와 방 ID(roomId)를 포함한 응답 DTO
     * @throws BaseException 유효성 검사를 통과하지 못했을 때 예외가 발생합니다.
     */
    @Transactional
    public JoinRoomResponse joinRoom(UUID roomId, UUID userId, JoinRoomRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        // 예약 방은 시작 시간 10분 전부터 입장 가능
        if (room.getStatus() == RoomStatus.SCHEDULED) {
            LocalDateTime entryAllowedTime = room.getStartAt().minusMinutes(10);
            if (LocalDateTime.now().isBefore(entryAllowedTime)) {
                throw new BaseException(ErrorCode.TOO_EARLY_TO_JOIN);
            }
        } else if (room.getStatus() != RoomStatus.LIVE) {
            // 진행 중인 방만 입장 가능
            throw new BaseException(ErrorCode.ROOM_NOT_LIVE);
        }

        // 이미 참여 중인 유저의 중복 참여 방지
        if (roomHistoryRepository.existsByRoomAndUserAndStatus(room, user, HistoryStatus.JOINED)) {
            throw new BaseException(ErrorCode.ALREADY_JOINED_ROOM);
        }

        // 정원 초과 여부 확인
        if (room.getCurrentCount() >= room.getMaxUser()) {
            throw new BaseException(ErrorCode.ROOM_FULL);
        }

        // PRIVATE 방일 경우 초대코드 확인
        if (room.getAccessType() == AccessType.PRIVATE) {
            if (!room.isCodeMatch(request.getCode())) {
                throw new BaseException(ErrorCode.INVALID_CODE);
            }
        }

        RoomHistory history = RoomHistory.builder()
                .room(room)
                .user(user)
                .role(RoomRole.GUEST)
                .build();

        roomHistoryRepository.save(history);

        room.increaseCurrentCount();

        return JoinRoomResponse.builder()
                .historyId(history.getHistoryId())
                .roomId(room.getRoomId())
                .build();
    }

    /**
     * 입장 기록이 존재하는지 검증합니다.
     *
     * @param roomId 방의 고유 식별자(UUID)
     * @param userId 유저의 고유 식별자(UUID)
     * @throws BaseException 유저/방이 없거나, 입장 기록이 없는 경우 발생
     */
    @Transactional(readOnly = true)
    public void validateJoin(UUID roomId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        boolean joined = roomHistoryRepository.existsByRoomAndUserAndStatus(room, user, HistoryStatus.JOINED);
        if (!joined) {
            throw new BaseException(ErrorCode.ROOM_HISTORY_NOT_FOUND);
        }
    }

    /**
     * 유저가 현재 참여 중인 방에서 퇴장합니다.
     *
     * <p>유저의 현재 참여 기록(History)을 찾아 '퇴장(LEFT)' 상태로 변경하고,
     * 방의 현재 인원수를 1 감소시킵니다.</p>
     *
     * <p>퇴장 처리가 완료된 후 방의 상태가 'LIVE'이고 남은 인원이 0명 이하일 경우,
     * 해당 방을 자동으로 종료(FINISHED/CLOSED) 처리합니다.</p>
     *
     * @param roomId 퇴장하려는 방의 고유 식별자(UUID)
     * @param userId 퇴장을 요청한 유저의 고유 식별자(UUID)
     * @throws BaseException 유저, 방, 또는 방에 '참여 중(JOINED)'인 기록이 없을 경우 발생
     */
    @Transactional
    public void leaveRoom(UUID roomId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        RoomHistory history = roomHistoryRepository.findByRoomAndUserAndStatus(room, user, HistoryStatus.JOINED)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_HISTORY_NOT_FOUND));

        history.leave();
        room.decreaseCurrentCount();

        // LIVE 상태이면서 인원이 0명인 경우 방 종료
        if (room.getStatus() == RoomStatus.LIVE && room.getCurrentCount() <= 0) {
            room.finish();
        }

        // 참여 기록을 통해 독서 시간(분) 계산
        long minutes = java.time.Duration.between(history.getJoinedAt(), history.getLeftAt()).toMinutes();

        // 방을 나가는 순간 유저의 TotalReadingTime 업데이트
        userService.updateTotalReadingTime(userId, minutes);
    }

    /**
     * 조건에 맞는 방 목록을 페이징하여 조회합니다.
     *
     * <p>현재 진행 중(LIVE)이거나 예정된(SCHEDULED) 상태의 방만 조회 대상에 포함됩니다.
     * 요청받은 keyword(검색어)를 제목에 포함하거나 코드와 일치하는 방을 검색합니다.
     * 요청받은 RoomType(층)이 존재하면 해당 타입의 방만 필터링하고,
     * 존재하지 않을 경우(null) 모든 타입의 활성화된 방을 조회합니다.</p>
     *
     * @param roomType 조회할 방의 타입. null일 경우 타입 구분 없이 전체 조회
     * @param keyword 검색어 (제목 또는 코드)
     * @param pageable 페이징 정보 (page, size, sort)
     * @return 상태 조건(LIVE, SCHEDULED)을 만족하는 방 목록을 담은 Page 객체
     */
    @Transactional(readOnly = true)
    public Page<RoomListResponse> getRooms(RoomType roomType, String keyword, Pageable pageable) {
        List<RoomStatus> activeStatuses = List.of(RoomStatus.LIVE, RoomStatus.SCHEDULED);
        Page<Room> rooms;

        // keyword와 roomType에 따라 검색 또는 조회
        if (keyword != null && !keyword.isBlank()) {
            // keyword가 있는 경우 방 제목 또는 코드 검색
            rooms = roomRepository.searchByKeyword(activeStatuses, keyword, pageable);
        } else if (roomType != null) {
            // keyword가 없고 roomType이 있는 경우 층별 필터링
            rooms = roomRepository.findByRoomTypeAndStatusIn(roomType, activeStatuses, pageable);
        } else {
            // 둘 다 없는 경우 전체 목록 조회
            rooms = roomRepository.findByStatusIn(activeStatuses, pageable);
        }

        return rooms.map(RoomListResponse::from);
    }

    /**
     * 특정 방의 상세 정보를 조회합니다.
     *
     * <p>요청된 방 ID(UUID)에 해당하는 방 엔티티를 데이터베이스에서 조회한 후,
     * 이를 상세 조회 응답 객체({@link RoomDetailResponse})로 변환하여 반환합니다.</p>
     *
     * @param roomId 조회할 방의 고유 식별자(UUID)
     * @return 방의 상세 정보(제목, 카테고리, 인원, 책 정보 등)를 담은 DTO
     * @throws BaseException 해당 ID를 가진 방이 존재하지 않을 경우 발생
     */
    @Transactional(readOnly = true)
    public RoomDetailResponse getRoomDetail(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        return RoomDetailResponse.from(room);
    }

}
