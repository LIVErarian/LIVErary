package com.liverary.backend.notification.repository;

import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SSE Emitter Repository
 * - 실시간 알림 전송을 위한 SseEmitter(연결 객체)와 이벤트 캐시를 관리하는 인메모리 저장소
 * - Emitter 관리: 사용자별 연결 객체를 저장하여 알림 발송 시 타겟을 식별함
 */
@Repository
public class EmitterRepository {

    // SSE 연결 객체 저장소 - 유저의 연결 정보 저장
    // Key: userId_timestamp (String) - Value: 실제 연결 객체 (SseEmitter)
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();


    /**
     * SSE 연결 객체를 저장
     * @param emitterId 식별자 (userId + "_" + systemTime)
     * @param sseEmitter 실제 연결 객체
     * @return
     */
    public SseEmitter save(String emitterId, SseEmitter sseEmitter){
        emitters.put(emitterId, sseEmitter);
        return sseEmitter;
    }


    /**
     * 특정 Emitter 삭제 (연결 종료 / 타임아웃 시)
     * @param emitterId 삭제할 Emitter 식별자
     */
    public void deleteById(String emitterId){
        emitters.remove(emitterId);
    }


    /**
     * 특정 유저와 연결된 모든 Emitter 조회
     * - 한 유저가 여러 기기 /브라우저에 접속했을 수 있으므로 Map으로 반환
     * @param userId
     * @return
     */
    public Map<String, SseEmitter> findAllEmitterStartWithByUserId(String userId){
        Map<String, SseEmitter> result = new ConcurrentHashMap<>();
        emitters.forEach((key, emitter)->{
            if(key.startsWith(userId)){
                result.put(key,emitter);
            }
        });
        return  result;
    }


    /**
     * 특정 유저와 연결된 모든 Emitter 삭제
     * - 로그아웃 시 해당 회원의 모든 단말기 연결을 끊음
     * @param userId
     */
    public void deleteAllEmittersStartWithUserId(String userId){
        emitters.forEach((key, emitter)->{
            if (key.startsWith(userId)) {
                emitters.remove(key);
            }
        });
    }

}
