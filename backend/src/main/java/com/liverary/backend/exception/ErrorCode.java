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
    CANNOT_UPDATE_TIME(HttpStatus.BAD_REQUEST, "R009", "참여자가 있어 시간을 변경할 수 없습니다."),
    ROOM_NOT_RESERVABLE(HttpStatus.BAD_REQUEST, "R011", "예약할 수 없는 상태의 방입니다."),
    ALREADY_RESERVED(HttpStatus.BAD_REQUEST, "R012", "이미 예약 신청한 방입니다."),
    NOT_RESERVED(HttpStatus.BAD_REQUEST, "R013", "예약 내역이 존재하지 않습니다."),
    TOO_LATE_TO_CANCEL_RESERVATION(HttpStatus.BAD_REQUEST, "R014", "시작 10분 전까지만 취소할 수 있습니다."),
    TOO_LATE_TO_CANCEL_ROOM(HttpStatus.BAD_REQUEST, "R015", "방 삭제는 시작 1시간 전까지만 가능합니다."),
    TOO_EARLY_TO_JOIN(HttpStatus.BAD_REQUEST, "R016", "입장은 시작 10분 전부터 가능합니다."),

    ROOM_INFO_REQUIRED(HttpStatus.BAD_REQUEST, "BD003", "방 정보를 입력해주세요."),

    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "A006", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다."),
    PASSWORD_WRONG(HttpStatus.BAD_REQUEST, "A007", "기존 비밀번호가 일치하지 않습니다."),
    SAME_AS_OLD_PASSWORD(HttpStatus.BAD_REQUEST, "A008", "새 비밀번호는 기존 비밀번호와 다르게 설정해야 합니다."),

    VERIFICATION_CODE_EXPIRED(HttpStatus.BAD_REQUEST, "A009", "인증 번호가 만료되었습니다."),
    VERIFICATION_CODE_MISMATCH(HttpStatus.BAD_REQUEST, "A010", "인증 번호가 일치하지 않습니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.BAD_REQUEST, "A011", "이메일 인증이 완료되지 않았습니다."),

    INVALID_UUID_FORMAT(HttpStatus.BAD_REQUEST, "A012", "유효한 UUID 형식이 아닙니다" ),
    SOCKET_ROOM_MISMATCH(HttpStatus.BAD_REQUEST, "WS001", "동일한 방의 사용자만 연결할 수 있습니다."),

    CANNOT_FRIEND_SELF(HttpStatus.BAD_REQUEST, "F001", "자기 자신에게 친구 요청을 보낼 수 없습니다."),
    USER_BLOCKED(HttpStatus.BAD_REQUEST, "F007", "차단된 사용자입니다."),
    CANNOT_BLOCK_SELF(HttpStatus.BAD_REQUEST, "F008", "자기 자신을 차단할 수 없습니다."),

    // 401 UNAUTHORIZED: 인증 실패
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증에 실패했습니다."),

    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "A002", "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "A004", "만료된 토큰입니다."),
    TOKEN_MALFORMED(HttpStatus.UNAUTHORIZED, "A005", "잘못된 형식의 토큰입니다."),

    PASSWORD_INVALID(HttpStatus.UNAUTHORIZED, "U003", "비밀번호가 일치하지 않습니다."),


    // 403 FORBIDDEN: 권한 없음
    FORBIDDEN(HttpStatus.FORBIDDEN, "A003", "접근 권한이 없습니다."),

    NOT_BOARD_OWNER(HttpStatus.FORBIDDEN, "BD002", "게시글 수정 및 삭제 권한이 없습니다."),
    INSUFFICIENT_PRIVILEGES(HttpStatus.FORBIDDEN, "BD004", "관리자 권한이 필요합니다."),

    NOT_REVIEW_OWNER(HttpStatus.FORBIDDEN, "RV002", "댓글 수정 및 삭제 권한이 없습니다."),

    NOT_ROOM_CREATOR(HttpStatus.FORBIDDEN, "R010", "방 수정 및 삭제 권한이 없습니다."),

    NOT_FRIEND_RECEIVER(HttpStatus.FORBIDDEN, "F002", "친구 요청 수락 권한이 없습니다."),
    NOT_FRIEND_RELATION(HttpStatus.FORBIDDEN, "F003", "해당 친구 관계에 대한 접근 권한이 없습니다."),


    // 404 NOT_FOUND: 리소스를 찾을 수 없음
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "C003", "요청한 리소스를 찾을 수 없습니다."),

    BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "해당 도서를 찾을 수 없습니다."),

    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CT001", "해당 카테고리를 찾을 수 없습니다."),

    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "BD001", "게시글을 찾을 수 없습니다."),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U002", "존재하지 않는 사용자입니다."),

    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "해당 방을 찾을 수 없습니다."),
    ROOM_HISTORY_NOT_FOUND(HttpStatus.NOT_FOUND, "R006", "참여 기록을 찾을 수 없습니다."),
    SOCKET_SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "WS002", "소켓 세션을 찾을 수 없습니다."),

    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "RV001", "댓글을 찾을 수 없습니다."),

    FRIEND_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "F004", "존재하지 않거나 이미 처리된 친구 요청입니다."),
    FRIEND_RELATION_NOT_FOUND(HttpStatus.NOT_FOUND, "F006", "친구 관계 정보를 찾을 수 없습니다."),

    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "N001", "알림을 찾을 수 없습니다."),

    // 409 CONFLICT: 중복된 리소스
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "C004", "이미 존재하는 데이터입니다."),

    EMAIL_DUPLICATE(HttpStatus.CONFLICT, "U001", "이미 사용중인 이메일입니다."),

    ALREADY_JOINED_ROOM(HttpStatus.CONFLICT, "R005", "이미 참여 중인 방입니다."),
    RESERVATION_CONFLICT(HttpStatus.CONFLICT, "R008", "해당 시간에 이미 예약된 일정이 존재합니다."),

    ALREADY_FRIEND_REQUEST(HttpStatus.CONFLICT, "F005", "이미 친구 상태이거나 수락 대기 중인 요청이 존재합니다."),

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
