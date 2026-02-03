import { useMemo, useState } from 'react';

import { useCategoryList } from '@/hooks/queries/useCategory';
import { useRecommendedRooms } from '@/hooks/queries/useRoomQueries';
import { useGameStore } from '@/store/useGameStore';

import * as styles from './BookTalkCategoryDropdown.css';

const ALL_OPTION = { id: '', label: '전체' } as const;

export const BookTalkCategoryDropdown = () => {
  const currentFloor = useGameStore((state) => state.currentFloor);
  const isActive = currentFloor === 'bookTalkFloor';

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useCategoryList(isActive);

  const options = useMemo(() => {
    return categories.map((category) => ({
      id: category.categoryId,
      label: category.name,
    }));
  }, [categories]);

  const [selectedId, setSelectedId] = useState<string>(ALL_OPTION.id);

  useRecommendedRooms(selectedId || undefined, isActive);

  if (!isActive) return null;

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>카테고리</span>
      <select
        className={styles.select}
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
      >
        <option value={ALL_OPTION.id}>{ALL_OPTION.label}</option>
        {isLoading && (
          <option value="" disabled>
            불러오는 중...
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
