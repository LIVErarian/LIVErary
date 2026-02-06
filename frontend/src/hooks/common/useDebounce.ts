import { useEffect, useState } from 'react';

/**
 * 값(Value)이 변경된 후 지정된 지연 시간(delay) 동안 추가 변경이 없을 때
 * 해당 값을 업데이트하여 반환하는 훅
 *
 * @param value 감시할 값
 * @param delay 지연 시간 (ms) - 기본값 300ms
 * @returns 디바운스 처리된 값
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay 시간 후에 값을 업데이트하는 타이머 설정
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup: 값이 변경되거나 컴포넌트가 언마운트되면 타이머 취소
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
