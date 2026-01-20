package com.liverary.backend.room.service;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.book.repository.BookRepository;
import com.liverary.backend.category.domain.Category;
import com.liverary.backend.category.repository.CategoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.dto.request.RoomCreateRequest;
import com.liverary.backend.room.dto.response.RoomCreateResponse;
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
}
