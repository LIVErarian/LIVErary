package com.liverary.backend.socket.dto.request;

import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * SDP Offer 수신 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class ReceiveVideoRequest {
    // 비디오 요청을 보낸 sender의 사용자 ID
    private UUID senderId;

    // 비디오 요청에 포함된 SDP Offer
    private String sdpOffer;
}