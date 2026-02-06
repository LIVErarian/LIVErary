import { useEffect, useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useCategoryList } from '@/hooks/queries/useCategory';
import { useSavePreferences } from '@/hooks/queries/useUserPreferences';
import { useAuthStore } from '@/store/useAuthStore';
import { type ModalType, useModalStore } from '@/store/useModalStore';

import * as styles from './PreferencesModal.css';

interface PreferencesModalProps {
  preferences?: string[];
  from?: ModalType;
}

export const PreferencesModal = ({
  preferences: initialPreferences,
  from,
}: PreferencesModalProps) => {
  const { closeModal } = useModalStore();
  const userId = useAuthStore((state) => state.user?.userId);

  const { data: categories = [], isLoading, isError } = useCategoryList(true);
  const { mutate: savePreferences, isPending } = useSavePreferences();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [warningMessage, setWarningMessage] = useState<string>('');

  // 초기값 설정
  useEffect(() => {
    if (categories.length > 0 && initialPreferences) {
      // 23개(전체)인 경우엔 선택된 게 없는 것으로 간주
      if (initialPreferences.length >= 23) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedIds([]);
        return;
      }

      const ids = categories
        .filter((cat) => initialPreferences.includes(cat.name))
        .map((cat) => cat.categoryId);
      setSelectedIds(ids);
    } else if (!initialPreferences) {
      // 초기값이 없으면 초기화
      setSelectedIds([]);
    }
    setWarningMessage('');
  }, [categories, initialPreferences]);

  const closeOrReturn = () => {
    if (from === 'profile') {
      // 프로필에서 왔으면 프로필 모달 다시 열기 (내 프로필)
      useModalStore.getState().openModal('profile');
    } else {
      closeModal();
    }
  };

  const handleClose = () => {
    if (isPending) return;

    // '나중에'를 누르면 모든 카테고리를 저장하여(전체 선택 상태), 다음 접속 시 모달이 뜨지 않게 한다.
    // 단, 이미 설정된 값이 있는 상태에서 닫기를 누른 경우(수정 모달)는 그냥 닫는다.
    if (!initialPreferences || initialPreferences.length === 0) {
      const allCategoryIds = categories.map((c) => c.categoryId);
      savePreferences(
        { categoryIds: allCategoryIds },
        {
          onSuccess: () => closeOrReturn(),
        },
      );
    } else {
      closeOrReturn();
    }
  };

  const toggleCategory = (categoryId: string) => {
    setWarningMessage('');
    setSelectedIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      if (prev.length >= 3) {
        setWarningMessage('최대 3개까지만 선택할 수 있어요.');
        return prev;
      }
      return [...prev, categoryId];
    });
  };

  const handleSubmit = () => {
    if (!userId) return;

    // 선택된 게 없으면 전체 저장 (사용자 요구사항: 아무것도 안 누르면 전체 선택으로 간주)
    // 프론트에서는 전체 선택 시 초기화되어 아무것도 선택되지 않은 것처럼 보임.
    const finalSelectedIds =
      selectedIds.length === 0
        ? categories.map((c) => c.categoryId)
        : selectedIds;

    savePreferences(
      { categoryIds: finalSelectedIds },
      {
        onSuccess: () => {
          closeOrReturn();
        },
      },
    );
  };

  return (
    <PixelModal
      isOpen={true}
      onClose={handleClose}
      title="선호 카테고리"
      width="520px"
    >
      <div className={styles.container}>
        <p className={styles.description}>
          관심 있는 카테고리를 선택해주세요. (최대 3개)
        </p>

        {warningMessage ? (
          <span className={styles.warning}>{warningMessage}</span>
        ) : (
          <span className={styles.helper}>
            선택하지 않으면 취향에 맞는 책을 추천받지 못할 수 있어요.
          </span>
        )}

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
            disabled={isPending}
          >
            {isPending ? '저장 중...' : '저장'}
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};
