package com.liverary.backend.notification.service;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.notification.dto.response.NotificationResponse;
import com.liverary.backend.notification.repository.EmitterRepository;
import com.liverary.backend.notification.repository.NotificationRepository;
import com.liverary.backend.notification.domain.Notification;
import com.liverary.backend.notification.domain.NotificationType;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmitterRepository emitterRepository;
    private final UserRepository userRepository;

    // 타임 아웃 시간 설정
    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60; // 60분

    /**
     * subscribe: 클라이언트가 로그인 후 SSE 연결을 요청할 때 호출
     * @param userId 연결 요청 유저 ID
     * @return sseEmitter 객체
     */
    public SseEmitter subscribe(UUID userId){
        // 1. 구분자 생성 (userId + 현재시간)
        String emitterId = userId + "_" + System.currentTimeMillis();

        // 2. emitter 생성 (타임아웃 설정)
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 3. 저장소에 저장
        emitterRepository.save(emitterId, emitter);

        // 4. 연결 종료 및 타임 아웃 시 저장소에서 제거
        emitter.onCompletion(()-> emitterRepository.deleteById(emitterId));
        emitter.onTimeout(()-> emitterRepository.deleteById(emitterId));

        // 5.첫 연결 시 503 에러 방지용 더미 데이터 전송
        sendToClient(emitter, emitterId, "EventStream Created. [userId = "+ userId + "]");
        return emitter;
    }


    /**
     * 알림 생성 및 실시간 전송
     * @param user 알림을 받을 유저 (receiver)
     * @param type 알림 타입 (FRIEND_REQUEST / BOARD_REVIEW / INQUIRY_REVIEW)
     * @param content 알림 내용
     */
    @Transactional
    public void send(User user, NotificationType type, String content) {
        // 1. DB에 알림 저장 (로그 남기기용)
        Notification notification = notificationRepository.save(
                Notification.builder()
                .user(user)
                .type(type)
                .content(content)
                .isRead(false)
                .build()
        );

        // 2. 현재 로그인한 유저의 모든 연결(emitter)을 찾음
        String userId = user.getUserId().toString();
        Map<String, SseEmitter> sseEmitters = emitterRepository.findAllEmitterStartWithByUserId(userId);

        // 3. 각 연결에 실시간 알림 전송
        NotificationResponse response = NotificationResponse.from(notification); // entity -> DTO
        sseEmitters.forEach((key, emitter)->{
            sendToClient(emitter, key, response);
        });

    }

    /**
     * 실제 SSE 데이터 전송
     * @param emitter SSE 연결 객체
     * @param id Emitter ID
     * @param data 전송할 데이터 (NotificationResponse)
     */
    private void sendToClient(SseEmitter emitter, String id, Object data){
        try{
            // "sse" 이름의 이벤트로 데이터 전송
            emitter.send(SseEmitter.event()
                    .id(id)
                    .name("sse")
                    .data(data));
        }
        catch(IOException e){
            // 전송 실패 시 리소스 정리
            emitterRepository.deleteById(id);
            log.error("SSE connection error (emitterId={})", id, e);
        }
    }

    /**
     * 알림 목록 조회
     * @param userId 조회할 유저 ID
     * @return 해당 유저의 알림 목록 List (최신순)
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(UUID userId) {
        // 1. User 엔티티 조회
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 2. 해당 유저의 알림 목록 조회 (최신순)
        List<Notification> notifications = notificationRepository.findAllByUserOrderByCreatedAtDesc(user);

        // 3. DTO로 변환하여 반환
        return notifications.stream().map(NotificationResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        // 1. 알림 조회
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(()-> new BaseException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // 2. 본인 알림인지 검증
        if(!notification.getUser().getUserId().equals(userId)){
            throw new BaseException(ErrorCode.FORBIDDEN);
        }

        // 3. 읽음 처리 (엔티티 메서드 호출)
        notification.read();
    }


}
