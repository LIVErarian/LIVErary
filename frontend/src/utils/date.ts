/**
 * 로컬 시간(시스템 설정)을 기준으로 YYYY-MM-DD 형식의 문자열을 반환합니다.
 * @returns {string} YYYY-MM-DD
 */
export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
