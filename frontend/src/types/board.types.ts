import type { CommonResponse } from './api.types';

// ======================= Enums =======================
export type BoardType = 'PROMOTION' | 'INQUIRY' | 'NOTICE';
export type BoardStatus = 'PENDING' | 'POSTED' | 'DELETED';

// ======================= Interfaces =======================
// 게시글 정보 페이징 응답
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

// 게시글 목록 아이템
export interface BoardListItem {
    boardId: string; // UUID
    title: string;
    nickname: string;
    type: BoardType;
    status: BoardStatus;
    createdAt: string;
}

// 상세 조회 응답 데이터
export interface BoardDetail {
    boardId: string;
    nickname: string;
    title: string;
    content: string;
    type: BoardType;
    status: BoardStatus;
    imageUrl?: string;
    createdAt: string;
    
    // 홍보 게시글 전용 필드 (Nullable)
    targetRoomId?: string;
    categoryName?: string;
    bookTitle?: string;
    bookAuthor?: string;
    bookCoverUrl?: string;
}


// ======================= API =======================
// 목록 조회 요청
export interface GetBoardListRequest {
    type: BoardType;
    keyword?: string;
    page?: number;
    size?: number;
    sort?: string;
}

// 목록 조회 응답
export type GetBoardListResponse = CommonResponse<PageResponse<BoardListItem>>;


// 상세 조회 응답
export type GetBoardDetailResponse = CommonResponse<BoardDetail>;


// 생성 요청
export interface CreateBoardRequest {
    title: string;
    content: string;
    type: BoardType;
    imageUrl?: string;
    roomId?: string;
    categoryName?: string;
    bookTitle?: string;
    bookAuthor?: string;
    bookCoverUrl?: string;
}

// 생성 응답 데이터
export interface BoardCreateResponseData {
  boardId: string;
}

// 생성 응답
export type CreateBoardResponse = CommonResponse<BoardCreateResponseData>;


// 수정 요청
export interface UpdateBoardRequest {
  boardId: string;
  title: string;
  content: string;
  imageUrl?: string;
  roomId?: string;
  categoryName?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookCoverUrl?: string;
}

// 수정 응답 데이터
export interface BoardUpdateResponseData {
  boardId: string;
}

// 수정 응답
export type UpdateBoardResponse = CommonResponse<BoardUpdateResponseData>;


// 삭제 응답
export type DeleteBoardResponse = CommonResponse<string>;
