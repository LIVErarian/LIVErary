package com.liverary.backend.socket.dto.request;

import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * ICE Candidate 전송 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class IceCandidateRequest {
    // ICE Candidate 상세 정보
    private IceCandidateInfo candidate;
    // Candidate 소유 사용자 ID
    private UUID userId;

    /**
     * WebRTC ICE Candidate 정보.
     */
    @Getter
    @NoArgsConstructor
    public static class IceCandidateInfo {
        private String candidate;
        private String sdpMid;
        private Integer sdpMLineIndex;
    }
}