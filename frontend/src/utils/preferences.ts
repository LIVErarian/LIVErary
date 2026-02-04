const PREFERENCE_STORAGE_PREFIX = 'preferences-onboarding';

// 같은 브라우저에서 사용자별로 온보딩 완료 여부를 분리 저장한다.
export const getPreferenceStorageKey = (userId: string) =>
  `${PREFERENCE_STORAGE_PREFIX}:${userId}`;

export const hasPreferenceCompleted = (userId: string) =>
  localStorage.getItem(getPreferenceStorageKey(userId)) === 'true';

// 서버 상태와 별개로 "한 번 본 사용자"를 프론트에서 기억한다.
export const setPreferenceCompleted = (userId: string) => {
  localStorage.setItem(getPreferenceStorageKey(userId), 'true');
};
