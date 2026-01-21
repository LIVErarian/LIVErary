package com.liverary.backend.config;

import org.kurento.client.KurentoClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * WebRTC용 KurentoClient를 빈으로 등록한다.
 */
@Configuration
public class WebRtcConfig {
    /**
     * Kurento 미디어 서버와 통신할 클라이언트를 생성한다.
     *
     * @return KurentoClient 인스턴스
     */
    @Bean
    public KurentoClient kurentoClient() {
        return KurentoClient.create();
    }
}
