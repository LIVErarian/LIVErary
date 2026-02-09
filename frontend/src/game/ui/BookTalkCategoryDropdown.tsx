import { useEffect, useMemo, useState } from 'react';

import { useCategoryList } from '@/services/queries/useCategory';
import { useRecommendedRooms } from '@/services/queries/useRoomQueries';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { useGameStore } from '@/store/useGameStore';

import * as styles from './BookTalkCategoryDropdown.css';

const ALL_OPTION = { id: '', label: '전체' } as const;

export const BookTalkCategoryDropdown = () => {
  const currentFloor = useGameStore((state) => state.currentFloor);
  const accessToken = useAuthStore((state) => state.accessToken);

  /**
   * 이 드롭다운은 독서 모임 공간(3층)에서만 의미가 있다.
   * 다른 층에서는 렌더링/요청 모두 하지 않는다.
   */
  const isActive = currentFloor === 'bookTalkFloor';

  /**
   * 인증 토큰이 없으면 요청이 401로 실패하면서
   * UI가 계속 "로딩 중"처럼 보일 수 있어 요청 자체를 막는다.
   */
  const canRequest = isActive && Boolean(accessToken);
  const setSelectedCategoryId = useBookTalkRoomStore(
    (state) => state.setSelectedCategoryId,
  );
  const setRecommendedRooms = useBookTalkRoomStore(
    (state) => state.setRecommendedRooms,
  );
  const clearRecommendedRooms = useBookTalkRoomStore(
    (state) => state.clearRecommendedRooms,
  );

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useCategoryList(canRequest);

  /**
   * select option 형태로 변환한 파생 데이터.
   * 카테고리 목록이 바뀔 때만 다시 계산한다.
   */
  const options = useMemo(() => {
    return categories.map((category) => ({
      id: category.categoryId,
      label: category.name,
    }));
  }, [categories]);

  const [selectedId, setSelectedId] = useState<string>(ALL_OPTION.id);

  const { data: recommendedRooms = [] } = useRecommendedRooms(
    selectedId || undefined,
    canRequest,
  );

  /**
   * 드롭다운 선택값을 전역 store에 동기화한다.
   * GameApp(React 바깥 클래스)에서도 현재 카테고리를 참조할 수 있도록 분리한다.
   */
  useEffect(() => {
    setSelectedCategoryId(selectedId);
  }, [selectedId, setSelectedCategoryId]);

  /**
   * 추천 방 목록을 전역 store에 저장한다.
   * zone 진입 시 room-1~4 인덱스에 맞춰 join API 호출에 사용된다.
   */
  useEffect(() => {
    if (!canRequest) {
      /**
       * 3층이 아니거나 토큰이 없으면 이전 추천방 데이터가 남지 않게 정리한다.
       * (남아 있으면 zone enter 시 잘못된 roomId로 매핑될 수 있음)
       */
      clearRecommendedRooms();
      return;
    }
    // 정상 상태에서는 최신 추천 결과를 그대로 저장한다.
    setRecommendedRooms(recommendedRooms);
  }, [
    canRequest,
    recommendedRooms,
    setRecommendedRooms,
    clearRecommendedRooms,
  ]);

  if (!isActive) return null;

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>카테고리</span>
      <select
        className={styles.select}
        value={selectedId}
        // 사용자가 카테고리를 바꾸면 추천 API 쿼리 키가 함께 변경된다.
        onChange={(event) => setSelectedId(event.target.value)}
        onKeyDown={(event) => {
          // 게임 이동 입력(키보드)과 select 키 조작이 충돌하지 않게 기본 동작 차단
          event.preventDefault();
        }}
      >
        <option value={ALL_OPTION.id}>{ALL_OPTION.label}</option>
        {isLoading && (
          <option value="" disabled>
            불러오는 중...
          </option>
        )}
        {!accessToken && (
          <option value="" disabled>
            로그인 정보 확인 중...
          </option>
        )}
        {isError && (
          <option value="" disabled>
            불러오기 실패
          </option>
        )}
        {!isLoading &&
          !isError &&
          options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
      </select>
    </div>
  );
};
