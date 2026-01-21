package com.liverary.backend.room.service;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.repository.BookRepository;
import com.liverary.backend.category.domain.Category;
import com.liverary.backend.category.repository.CategoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.*;
import com.liverary.backend.room.dto.request.JoinRoomRequest;
import com.liverary.backend.room.dto.request.RoomCreateRequest;
import com.liverary.backend.room.dto.response.JoinRoomResponse;
import com.liverary.backend.room.dto.response.RoomCreateResponse;
import com.liverary.backend.room.repository.RoomHistoryRepository;
import com.liverary.backend.room.repository.RoomRepository;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * 유저가 특정 방에 참여(입장)합니다.
     *
     * <p>방 입장 전 다음과 같은 유효성 검사를 수행합니다:</p>
     * <ul>
     * <li>방 상태가 'LIVE'인지 확인</li>
     * <li>이미 참여 중인 유저인지 확인</li>
     * <li>방의 정원(Max User) 초과 여부 확인</li>
     * <li>PRIVATE 방일 경우, 입력된 초대 코드 일치 여부 확인</li>
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

        // 진행 중인 방만 입장 가능
        if (room.getStatus() != RoomStatus.LIVE) {
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
    }

}
