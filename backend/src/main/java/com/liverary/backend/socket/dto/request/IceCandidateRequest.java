package com.liverary.backend.socket.dto.request;

import java.util.UUID;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * ICE Candidate 전송 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class IceCandidateRequest {

    // ICE Candidate 상세 정보
    @Valid
    @NotNull
    private IceCandidateInfo candidate;

    // Candidate 소유 사용자 ID
    @NotNull
    private UUID userId;

    /**
     * WebRTC ICE Candidate 정보.
     */
    @Getter
    @NoArgsConstructor
    public static class IceCandidateInfo {

        @NotNull
        private String candidate;

        @NotNull
        private String sdpMid;

        @NotNull
        private Integer sdpMLineIndex;
    }
}
