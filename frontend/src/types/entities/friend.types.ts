import type { CommonResponse } from '../common/api.types';

// 페이징 공통 응답 (friend 도메인 로컬 정의)
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  numberOfElements: number;
  empty: boolean;
}

// 친구 관계 상태
export type FriendRelationStatus =
  | 'NONE' // 관계 없음
  | 'FRIEND' // 이미 친구
  | 'PENDING_SENT' // 요청 보냄
  | 'PENDING_RECEIVED' // 요청 받음
  | 'BLOCKED_BY_ME' // 내가 차단함
  | 'MYSELF'; // 나 자신

// 친구 목록 모달 탭 타입
export type FriendListTabType = 'FRIENDS' | 'REQUESTS' | 'BLOCKED';

// 친구 요청/수락 상태
export type FriendStatus =
  | 'PENDING' // 대기 중
  | 'ACCEPTED' // 수락됨
  | 'BLOCKED'; // 차단됨

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

// 친구 정보 데이터 (Backend FriendResponse 대응)
export interface FriendData {
  friendId: string;
  userId: string; // 사용자 ID (프로필 조회용)
  email: string;
  nickname: string;
  status: FriendStatus;
}
// 단일 친구 정보 응답
export type FriendResponse = CommonResponse<FriendData>;

// 친구 목록 응답 (친구 목록, 요청 목록 공통 사용)
export type FriendListResponse = CommonResponse<PageResponse<FriendData>>;

// 친구 요청/수락/거절/삭제 등 액션 응답
export type FriendActionResponse = CommonResponse<null>;

// 친구 요청 전송 Body
export interface FriendRequest {
  //요청을 받을 유저 이메일
  receiverEmail: string;
}

// 차단/해제 요청 Body
export interface BlockRequest {
  email: string;
}
