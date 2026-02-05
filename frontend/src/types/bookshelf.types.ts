/**
 * 나의 서재 관련 타입 정의
 */

export interface UserBook {
  bookId: string;
  isbn: string; // 추가: API 응답에 isbn이 있어야 함
  title: string;
  author: string;
  coverUrl: string;
  status: UserBookStatus;
  categoryName: string;
  // 필요한 경우 추가 필드 정의
}

// 책 상태 Enum
export type UserBookStatus = 'WISH' | 'PENDING' | 'COMPLETED';

// page 응답 구조
export interface PageResponse<T> {
  content: T[]; // 실제 데이터 배열
  totalElements: number; // 전체 아이템 개수
  totalPages: number; // 전체 페이지 수
  size: number; // 페이지당 아이템 수
  number: number; // 현재 페이지 번호 (0부터 시작)
  first: boolean; // 첫 페이지 여부
  last: boolean; // 마지막 페이지 여부
  empty: boolean; // 빈 페이지 여부
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

export type UserBooksResponse = PageResponse<UserBook>;
