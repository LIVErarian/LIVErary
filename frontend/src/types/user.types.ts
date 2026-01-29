export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  userId: string; // back에서 지정하는 uuid
  email: string;
  nickname: string;
  role: UserRole;
  totalReadingTime: number; // 분 단위
  bookCounts: {
    wish: number;
    reading: number;
    completed: number;
  };
}
