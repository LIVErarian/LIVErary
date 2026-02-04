import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useCategoryList } from '@/hooks/queries/useCategory';
import { useSavePreferences } from '@/hooks/queries/useUserPreferences';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './PreferencesModal.css';

export const PreferencesModal = () => {
  const { currentModal, closeModal } = useModalStore();
  const userId = useAuthStore((state) => state.user?.userId);
  const isOpen = currentModal === 'preferences';

  const { data: categories = [], isLoading, isError } = useCategoryList(isOpen);
  const { mutate: savePreferences, isPending } = useSavePreferences();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleClose = () => {
    if (isPending) return;
    if (!userId) {
      closeModal();
      return;
    }

    const allCategoryIds = categories.map((category) => category.categoryId);
    if (allCategoryIds.length === 0) {
      closeModal();
      return;
    }

    savePreferences(
      { categoryIds: allCategoryIds },
      {
        onSuccess: () => {
          closeModal();
        },
      },
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleSubmit = () => {
    if (!userId || selectedIds.length === 0) return;

    savePreferences(
      { categoryIds: selectedIds },
      {
        onSuccess: () => {
          closeModal();
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={handleClose}
      title="선호 카테고리"
      width="520px"
    >
      <div className={styles.container}>
        <p className={styles.description}>
          관심 있는 카테고리를 선택해주세요. 여러 개 선택할 수 있어요.
        </p>
        <div className={styles.list}>
          {isLoading && <div className={styles.emptyState}>불러오는 중...</div>}
          {isError && (
            <div className={styles.emptyState}>
              카테고리를 불러오지 못했어요.
            </div>
          )}
          {!isLoading &&
            !isError &&
            categories.map((category) => {
              const isSelected = selectedIds.includes(category.categoryId);
              return (
                <PixelButton
                  key={category.categoryId}
                  size="sm"
                  variant={isSelected ? 'primary' : 'beige'}
                  onClick={() => toggleCategory(category.categoryId)}
                >
                  {category.name}
                </PixelButton>
              );
            })}
          {!isLoading && !isError && categories.length === 0 && (
            <div className={styles.emptyState}>카테고리가 없습니다.</div>
          )}
        </div>
        <span className={styles.helper}>선택하지 않으면 저장할 수 없어요.</span>
        <div className={styles.footer}>
          <PixelButton
            size="sm"
            variant="beige"
            onClick={handleClose}
            disabled={isPending}
          >
            나중에
          </PixelButton>
          <PixelButton
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            disabled={isPending || selectedIds.length === 0}
          >
            {isPending ? '저장 중...' : '저장'}
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};
