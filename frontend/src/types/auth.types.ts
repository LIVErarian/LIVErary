// 유저 정보
export interface UserInfo {
  email: string;
  nickname: string;
  avatarUrl?: string;
}

// TODO: 백엔드와 맞춰보기
export interface LoginResponse {
  accessToken: string;
  user: UserInfo;
}
