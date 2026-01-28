export type BookStatus = 'WISH' | 'READING' | 'COMPLETED';

export interface Book {
  isbn: string; // pk
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
