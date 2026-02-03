/**
 * 나의 서재 관련 타입 정의
 */

// 찜한 책 단일 아이템 인터페이스
export interface WishedBook {
  wishId: string; // 찜 기록 고유 ID (UUID)
  bookId: string; // 책 고유 ID (UUID)
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  coverImage: string;
  publishDate: string;
  createdAt: string;
}

// 읽은 책 관련 타입
// 읽기 상태 Enum
export type ReadStatus = 'READING' | 'COMPLETED' | 'WISH';

// 읽은 책 단일 아이템 인터페이스
export interface ReadBook {
  readHistoryId: string; // 읽기 기록 고유 id(UUID)
  bookId: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  coverImage: string;
  publishDate: string;
  readStatus: ReadStatus;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

// page 응답 구조 - generic (WishedBook / ReadBook)
export interface PageResponse<T> {
  content: T[]; // 실제 데이터 배열
  totalElements: number; // 전체 아이템 개수
  totalPages: number; // 전체 페이지 수
  size: number; // 페이지당 아이템 수 (기본 20)
  number: number; // 현재 페이지 번호 (0부터 시작)
  first: boolean; // 첫 페이지 여부
  last: boolean; // 마지막 페이지 여부
  empty: boolean; // 빈 페이지 여부
}

// API 응답 타입
export interface BaseResponse<T> {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: T | null;
}

// Type Alias
export type WishedBooksResponse = PageResponse<WishedBook>;
export type ReadBooksResponse = PageResponse<ReadBook>;
