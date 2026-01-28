// 공통 응답 형식
export interface CommonResponse<T> {
  status: string;
  code: string;
  message: string;
  data: T;
}
