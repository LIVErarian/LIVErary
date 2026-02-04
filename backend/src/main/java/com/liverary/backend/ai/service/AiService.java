package com.liverary.backend.ai.service;

import com.liverary.backend.ai.client.AiServingClient;
import com.liverary.backend.ai.dto.request.AiRecommendRequest;
import com.liverary.backend.ai.dto.response.AiRecommendResponse;
import com.liverary.backend.bookHistory.domain.BookHistory;
import com.liverary.backend.bookHistory.domain.BookStatus;
import com.liverary.backend.bookHistory.repository.BookHistoryRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.repository.RoomRepository;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.domain.UserPreference;
import com.liverary.backend.user.repository.UserPreferenceRepository;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * AI 기반 추천 서비스를 담당하는 비즈니스 로직 클래스입니다.
 *
 * <p>사용자의 독서 기록, 선호도, 현재 개설된 방 정보를 취합하여 AI 서버에 추천을 요청하고,
 * 그 결과를 바탕으로 사용자에게 적합한 독서 모임 방 목록을 반환합니다.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiService {

    private final AiServingClient aiServingClient;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final BookHistoryRepository bookHistoryRepository;

    /**
     * 사용자의 활동 이력을 기반으로 맞춤형 독서 모임 방을 추천합니다.
     *
     * <p>사용자의 읽은 책, 찜한 책, 선호 카테고리 정보를 수집하여 AI 모델에 전달하고,
     * AI가 추천한 방 ID 목록을 필터링하여 반환합니다.</p>
     *
     * @param userId 추천을 요청한 사용자의 UUID 문자열
     * @return AI가 추천한 Room 엔티티 리스트
     * @throws RuntimeException 유효하지 않은 사용자일 경우 발생
     */
    public List<Room> getRecommendedRooms(UUID userId) {

        User user = userRepository.findById(userId).orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 추천 대상이 될 후보 방 목록 조회 (현재 열려있는 모든 방)
        List<Room> allRooms = roomRepository.findAll();

        // 유저 선호 카테고리 조회
        List<UserPreference> preferences = userPreferenceRepository.findByUser(user);

        // 읽은 책 목록 조회
        List<BookHistory> readHistories = bookHistoryRepository.findByUserAndStatus(user, BookStatus.COMPLETED, Pageable.unpaged()).getContent();

        // 찜한 책 목록 조회
        List<BookHistory> likedHistories = bookHistoryRepository.findByUserAndStatus(user, BookStatus.WISH, Pageable.unpaged()).getContent();

        // 수집된 데이터를 AI 서버 요청 전용 DTO로 변환
        AiRecommendRequest request = createAiRequest(preferences, readHistories, likedHistories, allRooms);

        // AI 서버에 추천 요청 전송 및 응답 수신
        AiRecommendResponse response = aiServingClient.sendRecommendationRequest(request);

        // AI가 추천한 방 ID 리스트 추출
        List<String> recommendedRoomIds = response.getTopIndices();

        // 전체 방 목록 중 AI가 추천한 ID에 해당하는 방만 필터링하여 반환
        return allRooms.stream().filter(r -> recommendedRoomIds.contains(r.getRoomId().toString())).toList();

    }

    /**
     * 도메인 엔티티들을 AI 서버 요청 포맷(DTO)으로 변환합니다.
     *
     * <p>UUID로 된 카테고리를 사람이 읽을 수 있는 텍스트로 변환하고,
     * 각 엔티티의 필요한 필드만을 추출하여 요청 객체를 생성합니다.</p>
     *
     * @param preferences    사용자의 선호 카테고리 목록
     * @param readHistories  사용자가 읽은 책 기록
     * @param likedHistories 사용자가 찜한 책 기록
     * @param rooms          추천 후보 방 목록
     * @return AI 서버로 전송할 AiRecommendRequest 객체
     */
    private AiRecommendRequest createAiRequest(List<UserPreference> preferences, List<BookHistory> readHistories, List<BookHistory> likedHistories, List<Room> rooms) {

        // 유저 선호 카테고리 추출
        List<String> categoryNames = preferences.stream().map(p -> p.getCategory().getName()).toList();

        // 읽은 책
        List<AiRecommendRequest.BookInfo> readBooks = readHistories.stream().filter(h -> h.getStatus() == BookStatus.COMPLETED).map(h -> AiRecommendRequest.BookInfo.builder().title(h.getBook().getTitle()).category(h.getBook().getCategory().getName()).build()).toList();

        // 찜한 책
        List<AiRecommendRequest.BookInfo> likedBooks = likedHistories.stream().filter(h -> h.getStatus() == BookStatus.WISH).map(h -> AiRecommendRequest.BookInfo.builder().title(h.getBook().getTitle()).category(h.getBook().getCategory().getName()).build()).toList();

        // 방 목록 변환
        List<AiRecommendRequest.RoomInfo> roomInfos = rooms.stream().map(r -> AiRecommendRequest.RoomInfo.builder().roomId(r.getRoomId()).category(r.getCategory().getName()).title(r.getTitle()).bookTitle(r.getBook() != null ? r.getBook().getTitle() : null).bookCategory(r.getBook() != null ? r.getBook().getCategory().getName() : null).build()).toList();

        return AiRecommendRequest.builder().categories(categoryNames).readBooks(readBooks).likedBooks(likedBooks).roomHistory(List.of()).roomList(roomInfos).build();

    }
}
