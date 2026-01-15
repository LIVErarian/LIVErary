package com.liverary.backend.exception;

import com.liverary.backend.common.dto.BaseResponse;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외를 처리하여 공통 응답 포맷으로 변환하는 핸들러 클래스
 *
 * BaseException을 포함한 모든 예외를 가로채어
 * 클라이언트가 이해할 수 있는 규격화된 에러 응답 반환
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 비즈니스 로직 중 발생하는 커스텀 예외 처리
     *
     * @param e 프로젝트 기저 예외인 BaseException 객체
     * @return HTTP 상태 코드와 에러 정보가 담긴 ResponseEntity
     */
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<BaseResponse<?>> handleCustomException(BaseException e) {
        ErrorCode errorCode = e.getErrorCode();
        log.error("🚨 CustomException: {} ({})", errorCode.getMessage(), errorCode.getCode());

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(BaseResponse.error(errorCode.getCode(), errorCode.getMessage()));
    }

    /**
     * 예측하지 못한 시스템 예외 처리
     *
     * @param e 시스템 예외(Exception) 객체
     * @return 500 에러 상태와 공통 서버 에러 메시지가 담긴 ResponseEntity
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<?>> handleException(Exception e) {
        log.error("🚨 Unhandled Exception: ", e);

        return ResponseEntity
                .status(ErrorCode.INTERNAL_SERVER_ERROR.getStatus())
                .body(BaseResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }

}
