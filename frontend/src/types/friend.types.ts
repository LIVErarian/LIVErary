
import type { CommonResponse } from './api.types';

// 친구 관계 상태
export type FriendRelationStatus =
    | 'NONE'                // 관계 없음
    | 'FRIEND'              // 이미 친구
    | 'PENDING_SENT'        // 요청 보냄
    | 'PENDING_RECEIVED'    // 요청 받음
    | 'BLOCKED_BY_ME'       // 내가 차단함
    | 'MYSELF';             // 나 자신

// 친구 요청/수락 상태
export type FriendStatus =
    | 'PENDING'     // 대기 중
    | 'ACCEPTED'    // 수락됨
    | 'BLOCKED';    // 차단됨

// 유저 검색 요청
export interface UserSearchRequest {
    //검색할 이메일
    email: string;
}

// 유저 검색 결과 데이터
export interface UserSearchData {
    userId: string;
    email: string;
    nickname: string;
    relationStatus: FriendRelationStatus;
}
// 유저 검색 응답
export type UserSearchResponse = CommonResponse<UserSearchData>;

// 친구 정보 데이터
export interface FriendData {
    friendId: string;
    email: string;
    nickname: string;
    status: FriendStatus;
}
// 친구 목록/정보 응답
export type FriendResponse = CommonResponse<FriendData>;

// 친구 요청 응답
export type FriendRequestResponse = CommonResponse<null>;

// 친구 요청 전송 Body
export interface FriendRequest {
    //요청을 받을 유저 이메일
    receiverEmail: string;
}
