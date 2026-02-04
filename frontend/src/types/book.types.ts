export type BookStatus = 'WISH' | 'READING' | 'COMPLETED';

export interface Book {
  isbn: string;
  itemId: number;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
}

export interface BookDetail extends Book {
  publisher: string;
  purchaseUrl: string;
  content: string; // 책 설명
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
