package com.liverary.backend.notification.service;

import com.liverary.backend.notification.repository.EmitterRepository;
import com.liverary.backend.notification.repository.NotificationRepository;
import com.liverary.backend.notification.domain.Notification;
import com.liverary.backend.notification.domain.NotificationType;
import com.liverary.backend.user.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmitterRepository emitterRepository;

    // 타임 아웃 시간 설정
    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60;

    /**
     * subscribe: 클라이언트가 로그인 후 SSE 연결을 요청할 때 호출
     * @param userId
     * @return
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
     * @param receiver
     * @param type
     * @param content
     * @param url
     */
    @Transactional
    public void send(User receiver, NotificationType type, String content, String url) {
        // 1. DB에 알림 저장 (로그 남기기용)
        Notification notification = notificationRepository.save(
                Notification.builder()
                .receiver(receiver)
                .type(type)
                .content(content)
                .relatedUrl(url)
                .isRead(false)
                .build()
        );

        // 2. 현재 로그인한 유저의 모든 연결(emitter)을 찾음
        String userId = receiver.getUserId().toString();
        Map<String, SseEmitter> sseEmitters = emitterRepository.findAllEmitterStartWithByUserId(userId);

        // 3. 각 연결에 실시간 알림 전송
        sseEmitters.forEach((key, emitter)->{
            sendToClient(emitter, key, notification);
        });

    }

    /**
     * 실제 SSE 데이터 전송
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
            emitterRepository.deleteById(id);
            log.error("SSE connection error (emitterId={})", id, e);
        }
    }


}
