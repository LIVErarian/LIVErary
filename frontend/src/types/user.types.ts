export type UserRole = 'USER' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE';

export interface UserProfile {
  userId: string; // back에서 지정하는 uuid
  email: string;
  nickname: string;
  gender: Gender;
  role: UserRole;
  totalReadingTime: number; // 분 단위
  bookCounts: {
    wish: number;
    reading: number;
    completed: number;
  };
}
