// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyVoidFunction = (...args: any[]) => void;

/**
 * 함수 실행 빈도를 제한하는 스로틀링 함수
 * @param func 실행할 원본 함수
 * @param limit 제한 시간 (ms)
 * @returns 스로틀링이 적용된 새로운 함수
 */
export const throttle = <T extends AnyVoidFunction>(
  func: T,
  limit: number,
): T => {
  let inThrottle: boolean; // 실행 가능 여부 기억

  return ((...args: Parameters<T>) => {
    // 쿨타임이 아니라면 원본 함수 실행
    if (!inThrottle) {
      func(...args);
      inThrottle = true; // 쿨타임 시작

      // 지정된 시간이 지나면 쿨타임 해제
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as T;
};
