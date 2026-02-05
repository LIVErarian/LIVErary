import type { CommonResponse } from './api.types';

export type RoomType = 'READING' | 'TALK' | 'CONCERT' | 'STABLE';
export type AccessType = 'PUBLIC' | 'PRIVATE';
export type RoomStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';
export type RoomRole = 'GUEST' | 'MANAGER' | 'AUTHOR';

// 기본 정보
export interface ROOM_INFO {
  title: string;
  roomType: RoomType;
  accessType: AccessType;
  maxUser: number;
}

// 상세 정보
export interface ROOM_DETAIL extends ROOM_INFO {
  roomId: string;
  status: RoomStatus;
  categoryName: string;
  currentCount: number;
  startAt?: string;

  // 책 정보 (상세 조회용)
  bookTitle?: string;
  bookAuthor?: string;
  bookCoverUrl?: string;
}

// 추천 방 정보
export interface RECOMMENDED_ROOM {
  roomId: string;
  title: string;
  roomType: RoomType;
  accessType: AccessType;
  status: RoomStatus;
  categoryName: string;
  currentCount: number;
  maxUser: number;
}

// Pagination Wrapper
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ======================= API 요청/응답 =======================

// 라이브 방 목록 요청
export interface GetLiveRoomListRequest {
  categoryId?: string;
  accessType?: AccessType;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

// 예약 방 목록 요청
export interface GetReservationRoomListRequest {
  categoryId?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

// 방 목록 응답
export type GetRoomListResponse = CommonResponse<PageResponse<ROOM_DETAIL>>;

// 내 예약 목록 응답
export interface MyScheduledRoomResponseData {
  roomId: string;
  title: string;
}

export type MyScheduledRoomResponse = CommonResponse<
  MyScheduledRoomResponseData[]
>;

// 추천 방 목록 응답
export type GetRecommendedRoomResponse = CommonResponse<RECOMMENDED_ROOM[]>;

// 방 상세 조회
export interface GetRoomDetailRequest {
  roomId: string;
}

export type GetRoomDetailResponseData = ROOM_DETAIL;

export type GetRoomDetailResponse = CommonResponse<GetRoomDetailResponseData>;

// 방 코드 검색
export interface GetRoomSearchRequest {
  code: string;
}

export type GetRoomSearchResponse = CommonResponse<ROOM_DETAIL>;

// 방 생성
export interface CreateRoomRequest {
  title: string;
  roomType: RoomType;
  accessType: AccessType;
  maxUser: number;
  status: RoomStatus;
  categoryId?: string;
  isbn?: string;
  startAt?: string;
  endAt?: string;
}

export interface CreateRoomResponseData {
  roomId: string;
}

export type CreateRoomResponse = CommonResponse<CreateRoomResponseData>;

// 방 참여
export interface JoinRoomRequest {
  code?: string;
}

export interface JoinRoomResponseData {
  roomId: string;
}

export type JoinRoomResponse = CommonResponse<JoinRoomResponseData>;

// 방 퇴장
export interface LeaveRoomRequest {
  roomId: string;
}

export type LeaveRoomResponse = CommonResponse<string>;

// 예약된 방 참여 신청
export interface ApplyScheduledRoomRequest {
  roomId: string;
}

export interface ApplyScheduledRoomResponseData {
  code: string;
}

export type ApplyScheduledRoomResponse =
  CommonResponse<ApplyScheduledRoomResponseData>;

// 예약된 방 참여 취소
export interface DeleteApplyScheduledRequest {
  roomId: string;
}

export type DeleteApplyScheduledResponse = CommonResponse<null>;

// 방 예약 정보 수정
export interface PatchScheduledRoomRequest {
  roomId?: string;
  title?: string;
  maxUser?: number;
  startAt?: string;
  endAt?: string;
  isbn?: string;
  categoryId?: string;
}

export interface PatchScheduledRoomResponseData {
  roomId: string;
  code: string;
}

export type PatchScheduledRoomResponse =
  CommonResponse<PatchScheduledRoomResponseData>;

// 예약된 방 삭제 (취소)
export interface DeleteScheduledRoomRequest {
  roomId: string;
}

export type DeleteScheduledRoomResponse = CommonResponse<null>;
