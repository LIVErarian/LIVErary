package com.liverary.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 프로젝트 전역에서 사용하는 공통 에러 코드
 *
 * HTTP 상태 코드, 커스텀 에러 코드, 에러 메시지 관리
 * BaseException, GlobalExceptionHandler와 연동되어 일관된 응답 제공
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 400 BAD_REQUEST: 잘못된 요청
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "C001", "잘못된 요청입니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C002", "적절하지 않은 입력값입니다."),

    // 401 UNAUTHORIZED: 인증 실패
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증에 실패했습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A002", "유효하지 않은 토큰입니다."),

    // 403 FORBIDDEN: 권한 없음
    FORBIDDEN(HttpStatus.FORBIDDEN, "A003", "접근 권한이 없습니다."),

    // 404 NOT_FOUND: 리소스를 찾을 수 없음
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "C003", "요청한 리소스를 찾을 수 없습니다."),

    // 409 CONFLICT: 중복된 리소스
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "C004", "이미 존재하는 데이터입니다."),

    // 500 INTERNAL_SERVER_ERROR: 서버 에러
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S001", "서버 내부 오류가 발생했습니다."),
    EXTERNAL_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S002", "외부 API 연동 중 오류가 발생했습니다."),
    FILE_PROCESSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S003", "파일 처리 중 오류가 발생했습니다.");

    // 응답으로 반환할 HTTP 상태 코드
    private final HttpStatus status;

    // 프론트엔드 식별용 커스텀 에러 코드
    private final String code;

    // 클라이언트에 노출할 에러 메세지
    private final String message;

}
