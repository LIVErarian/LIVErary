package com.liverary.backend.socket.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReceiveVideoRequest {
    // 비디오 요청을 보내는 sender의 ID
    private UUID senderId;

    // 비디오 요청을 보내는 sender의 SdpOffer
    private String sdpOffer;
}
