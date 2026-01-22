package com.liverary.backend.socket.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ICE Candidate 전송 요청 DTO.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IceCandidateRequest {
    // ICE Candidate 상세 정보
    private IceCandidateInfo candidate;
    // Candidate 소유 사용자 ID
    private UUID userId;

    /**
     * WebRTC ICE Candidate 정보.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IceCandidateInfo {
        private String candidate;
        private String sdpMid;
        private Integer sdpMLineIndex;
    }
}