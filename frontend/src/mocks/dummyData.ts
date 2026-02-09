// TODO: API 연결 후 삭제 필요
import type { Book } from '@/types/book.types';
import type { UserProfile } from '@/types/user.types';

export const DUMMY_USER: UserProfile = {
  userId: '1234-5678-uuid',
  email: 'test@example.com',
  nickname: '테스트',
  role: 'USER',
  preferences: null,
  totalReadingTime: 0,
  bookCounts: {
    wish: 0,
    reading: 0,
    completed: 0,
  },
};

export const DUMMY_BOOKS: Book[] = [
  {
    isbn: '1',
    title: '해리포터와 마법사의 돌',
    author: 'J.K. 롤링',
    category: '판타지',
    coverUrl: 'https://image.yes24.com/goods/136727687/XL',
  },
  {
    isbn: '2',
    title: '클린 코드',
    author: '로버트 C. 마틴',
    category: '비문학',
    coverUrl: 'https://image.yes24.com/goods/11681152/XL',
  },
  {
    isbn: '3',
    title: '물고기는 존재하지 않는다',
    author: '룰루 밀러',
    category: '문학',
    coverUrl: 'https://image.yes24.com/goods/105526047/XL',
  },
  {
    isbn: '4',
    title: '함께 자라기',
    author: '김창준',
    category: '비문학',
    coverUrl: 'https://image.yes24.com/goods/67350256/XL',
  },
];
