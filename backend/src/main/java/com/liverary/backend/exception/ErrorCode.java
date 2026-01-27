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

    ROOM_NOT_LIVE(HttpStatus.BAD_REQUEST, "R002", "참여 가능한 상태의 방이 아닙니다."),
    ROOM_FULL(HttpStatus.BAD_REQUEST, "R003", "방의 정원이 초과되었습니다."),
    INVALID_CODE(HttpStatus.BAD_REQUEST, "R004", "참여 코드가 일치하지 않습니다."),
    INVALID_TIME_RANGE(HttpStatus.BAD_REQUEST, "R007", "종료 시각은 시작 시각 이후여야 합니다."),

    BOOK_INFO_REQUIRED(HttpStatus.BAD_REQUEST, "BD003", "책 정보를 입력해주세요."),

    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "A006", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다."),
    PASSWORD_WRONG(HttpStatus.BAD_REQUEST, "A007", "기존 비밀번호가 일치하지 않습니다."),
    SAME_AS_OLD_PASSWORD(HttpStatus.BAD_REQUEST, "A008", "새 비밀번호는 기존 비밀번호와 다르게 설정해야 합니다."),

    VERIFICATION_CODE_EXPIRED(HttpStatus.BAD_REQUEST, "A009", "인증 번호가 만료되었습니다."),
    VERIFICATION_CODE_MISMATCH(HttpStatus.BAD_REQUEST, "A010", "인증 번호가 일치하지 않습니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.BAD_REQUEST, "A011", "이메일 인증이 완료되지 않았습니다."),

    // 401 UNAUTHORIZED: 인증 실패
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증에 실패했습니다."),

    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "A002", "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "A004", "만료된 토큰입니다."),
    TOKEN_MALFORMED(HttpStatus.UNAUTHORIZED, "A005", "잘못된 형식의 토큰입니다."),

    PASSWORD_INVALID(HttpStatus.UNAUTHORIZED, "U003", "비밀번호가 일치하지 않습니다."),

    // 403 FORBIDDEN: 권한 없음
    FORBIDDEN(HttpStatus.FORBIDDEN, "A003", "접근 권한이 없습니다."),
    NOT_BOARD_OWNER(HttpStatus.FORBIDDEN, "BD002", "게시글 수정 및 삭제 권한이 없습니다."),
    NOT_REVIEW_OWNER(HttpStatus.FORBIDDEN, "RV002", "댓글 수정 및 삭제 권한이 없습니다."),

    // 404 NOT_FOUND: 리소스를 찾을 수 없음
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "C003", "요청한 리소스를 찾을 수 없습니다."),
    BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "해당 도서를 찾을 수 없습니다."),
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CT001", "해당 카테고리를 찾을 수 없습니다."),
    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "BD001", "게시글을 찾을 수 없습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U002", "존재하지 않는 사용자입니다."),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "해당 방을 찾을 수 없습니다."),
    ROOM_HISTORY_NOT_FOUND(HttpStatus.NOT_FOUND, "R006", "참여 기록을 찾을 수 없습니다."),
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "RV001", "댓글을 찾을 수 없습니다."),

    // 409 CONFLICT: 중복된 리소스
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "C004", "이미 존재하는 데이터입니다."),

    EMAIL_DUPLICATE(HttpStatus.CONFLICT, "U001", "이미 사용중인 이메일입니다."),
    ALREADY_JOINED_ROOM(HttpStatus.CONFLICT, "R005", "이미 참여 중인 방입니다."),
    RESERVATION_CONFLICT(HttpStatus.CONFLICT, "R008", "해당 시간에 이미 예약된 일정이 존재합니다."),

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
