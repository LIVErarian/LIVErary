import type { CommonResponse } from './api.types';

export type RoomType = 'READING' | 'TALK' | 'CONCERT';
export type AccessType = 'PUBLIC' | 'PRIVATE';
export type RoomStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'; // LIVE가 default
export type RoomRole = 'GUEST' | 'MANAGER' | 'AUTHOR'; // GUEST가 default

// 기본 방 정보
export interface ROOM_INFO {
  title: string;
  roomType: RoomType;
  accessType: AccessType;
  maxUser: number;
}

// 상세 정보
export interface ROOM_DETAIL extends ROOM_INFO {
  roomId: string; // uuid
  status: RoomStatus;
  categoryName: string;
  currentCount: number; // 현재 참여 인원
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

// ======================= API =======================
// 방 검색 요청
export interface GetRoomListRequest {
  roomType?: RoomType;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

// Pagination Wrapepr
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type GetRoomListResponse = CommonResponse<PageResponse<ROOM_DETAIL>>;

// 방 상세 검색 요청
export interface GetRoomDetailRequest {
  roomId: string;
}

// 방 상세 검색 응답
export interface GetRoomDetailResponseData extends ROOM_DETAIL {
  bookTitle?: string;
  bookAuthor?: string;
  bookCoverUrl?: string;
}

// 방 상세 검색 전체 응답
export type GetRoomDetailResponse = CommonResponse<GetRoomDetailResponseData>;

// 방 만들기 요청
export interface CreateRoomRequest extends ROOM_INFO {
  status: RoomStatus;
  isbn?: string;
  categoryId: string; // uuid
  startAt?: string; // status scheduled인 경우만 (ISO String)
  endAt?: string; // status scheduled인 경우만 (ISO String)
}

// 방 만들기 응답
export interface CreateRoomResponseData {
  roomId: string; // uuid
  code?: string; // private인 경우만
}

export type CreateRoomResponse = CommonResponse<CreateRoomResponseData>;

// 방 떠나기 요청
export interface LeaveRoomRequest {
  roomId: string; // uuid
}

// 방 떠나기 응답
export type LeaveRoomResponse = CommonResponse<null>;

// 방 들어가기 요청
export interface JoinRoomRequest {
  roomId: string; // uuid
  code: string;
}

// 방 들어가기 응답
export interface JoinRoomResponseData {
  roomId: string;
}

export type JoinRoomResponse = CommonResponse<JoinRoomResponseData>;

// 예약된 방 참여하기 요청
export interface ApplyScheduledRoomRequest {
  roomId: string;
}

// 예약된 방 참여하기 응답
export interface ApplyScheduledRoomResponseData {
  code: string;
}

export type ApplyScheduledRoomResponse =
  CommonResponse<ApplyScheduledRoomResponseData>;

// 예약된 방 참여 취소 요청
export interface DeleteApplyScheduledRequest {
  roomId: string;
}

// 예약된 방 참여 취소 응답
export type DeleteApplyScheduledResponse = CommonResponse<null>;

// 방 예약 정보 수정 요청
export interface PatchScheduledRoomRequest {
  roomId?: string; // roomId만 path variable
  title?: string;
  maxUser?: number;
  startAt?: string;
  endAt?: string;
  isbn?: string;
  categoryId?: string;
}

// 방 예약 정보 수정 응답
export interface PatchScheduledRoomResponseData {
  roomId: string;
  code: string;
}

export type PatchScheduledRoomResponse =
  CommonResponse<PatchScheduledRoomResponseData>;

// 예약된 방 취소 요청
export interface DeleteScheduledRoomRequest {
  roomId: string;
}

// 예약된 방 취소 응답
export type DeleteScheduledRoomResponse = CommonResponse<null>;

// 예약된 방 확인 응답
export interface GetScheduledRoomResponseData {
  roomId: string;
  title: string;
}

export type GetScheduledRoomResponse = CommonResponse<
  GetScheduledRoomResponseData[]
>;

// 추천 방 목록 응답
export type GetRecommendedRoomResponse = CommonResponse<RECOMMENDED_ROOM[]>;
