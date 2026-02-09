package com.liverary.backend.bookHistory.DTO.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 찜 상태 응답 DTO
 */
@Getter
@AllArgsConstructor
public class WishStatusResponse {

    // 찜 여부 (true: 찜함, false: 찜하지 않음)
    private boolean isWished;

    public static WishStatusResponse of(boolean isWished){
        return new WishStatusResponse(isWished);
    }
}