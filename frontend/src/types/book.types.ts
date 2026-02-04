export type BookStatus = 'WISH' | 'READING' | 'COMPLETED';

export interface Book {
  isbn: string;
  itemId: number;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  isWished?: boolean; // 찜 상태 (optional)
}

export interface WishStatusResponse {
  wished: boolean; // API 응답 실제 속성 이름
}

export interface BookDetail extends Book {
  publisher: string;
  purchaseUrl: string;
  content: string; // 책 설명
  description?: string;
}

export interface BookSearchResponse {
  content: Book[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
