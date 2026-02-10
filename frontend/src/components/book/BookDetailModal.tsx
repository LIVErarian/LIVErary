/**
 * BookDetailModal 컴포넌트
 *
 * 책 상세 정보를 표시하는 모달
 */

import { useEffect, useState } from 'react';

import { BaseModal } from '@/components/common/BaseModal';
import { HeartButton } from '@/components/common/HeartButton';
import { useBookDetail, useToggleWishlist } from '@/services/queries/useBook';

import * as styles from './BookDetailModal.css';

interface BookDetailModalProps {
  isbn: string;
  onClose: () => void;
  initialIsWished?: boolean; // 검색 결과에서 전달받는 초기 좋아요 상태
  isOpen?: boolean;
}

export const BookDetailModal = ({
  isbn,
  onClose,
  initialIsWished,
  isOpen = true,
}: BookDetailModalProps) => {
  const { data: book, isLoading, isError } = useBookDetail(isbn);
  const toggleWishlistMutation = useToggleWishlist();

  // 찜 상태 관리 (검색 결과의 초기 상태 반영)
  const [isWished, setIsWished] = useState(initialIsWished ?? false);
  const [isTogglingWish, setIsTogglingWish] = useState(false);

  // book 데이터가 로드되면 찜 상태 동기화
  useEffect(() => {
    if (book && 'isWished' in book) {
      setIsWished(book.isWished ?? false);
    }
  }, [book]);

  // 구매 링크 열기
  const handlePurchaseClick = () => {
    if (book?.purchaseUrl) {
      window.open(book.purchaseUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // 찜 토글 핸들러 (검색 결과와 동기화)
  const handleToggleWish = async () => {
    if (!book || isTogglingWish) return;

    setIsTogglingWish(true);

    try {
      const result = await toggleWishlistMutation.mutateAsync(book.isbn);
      setIsWished(result.wished);
    } catch (error) {
      console.error('[BookDetailModal] Failed to toggle wishlist:', error);
      // 에러 시 원래 상태로 복구 (필요시 구현)
    } finally {
      setIsTogglingWish(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContainer}>
        {/* 닫기 버튼 */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className={styles.centerMessage}>
            📚 책 정보를 불러오는 중...
          </div>
        )}

        {/* 에러 상태 */}
        {isError && (
          <div className={styles.centerMessage}>
            ❌ 책 정보를 불러오는데 실패했습니다.
          </div>
        )}

        {/* 데이터 표시 */}
        {book && (
          <div className={styles.content}>
            {/* 상단 영역: 표지 + 기본 정보 */}
            <div className={styles.topSection}>
              {/* 책 표지 */}
              <img
                src={book.coverUrl}
                alt={book.title}
                className={styles.coverImage}
              />

              {/* 책 기본 정보 */}
              <div className={styles.bookInfo}>
                <h2 className={styles.title}>{book.title}</h2>

                <div className={styles.infoLine}>
                  <span className={styles.label}>저자</span>
                  <span className={styles.value}>{book.author}</span>
                </div>

                <div className={styles.infoLine}>
                  <span className={styles.label}>출판사</span>
                  <span className={styles.value}>{book.publisher}</span>
                </div>

                <div className={styles.infoLine}>
                  <span className={styles.label}>카테고리</span>
                  <span className={styles.value}>{book.category}</span>
                </div>

                <div className={styles.infoLine}>
                  <span className={styles.label}>ISBN</span>
                  <span className={styles.value}>{book.isbn}</span>
                </div>
              </div>
            </div>

            {/* 찜하기 버튼 */}
            <div className={styles.wishButtonContainer}>
              <HeartButton
                isWished={isWished}
                onClick={handleToggleWish}
                disabled={isTogglingWish}
              />
            </div>

            <div className={styles.divider} />

            {/* 책 소개 */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>📖 책 소개</h3>
              <p
                className={styles.description}
                dangerouslySetInnerHTML={{
                  __html:
                    book.content || book.description || '책 소개가 없습니다.',
                }}
              />
            </div>

            {/* 구매 버튼 */}
            {book.purchaseUrl && (
              <button
                className={styles.purchaseButton}
                onClick={handlePurchaseClick}
              >
                🧞 알라딘에서 구매하기 🪔
              </button>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};
