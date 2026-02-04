/**
 * BookCard 컴포넌트
 *
 * 개별 책 정보를 카드 형태로 표시하는 컴포넌트
 * 찜한 책 / 읽은 책 목록에서 재사용됩니다.
 */
import { useEffect, useState } from 'react';
import clsx from 'clsx'; // className 조합 유틸리티

import { HeartButton } from '@/components/common/HeartButton';

import type { Book } from '@/types/book.types';
import type { ReadBook, WishedBook } from '@/types/bookshelf.types';

import * as styles from './BookCard.css';

/**
 * BookCard 컴포넌트 Props
 * - book: WishedBook, ReadBook 또는 Book (검색 결과용)
 * - showWishButton: 찜 버튼 표시 여부
 * - onToggleWish: 찜 토글 콜백
 */
interface BookCardProps {
  book: WishedBook | ReadBook | Book;
  showWishButton?: boolean; // Optional: 찜 버튼 표시 여부
  onToggleWish?: (isbn: string) => Promise<boolean>; // Optional: 찜 토글
  // Force update
  onClick?: () => void; // Optional: 카드 클릭 이벤트
}

/**
 * ReadBook 타입인지 확인하는 타입 가드
 * readStatus 속성이 있으면 ReadBook으로 판단
 */
const isReadBook = (book: WishedBook | ReadBook | Book): book is ReadBook => {
  return 'readStatus' in book;
};

export const BookCard = ({
  book,
  showWishButton,
  onToggleWish,
  onClick,
}: BookCardProps) => {
  // 이미지 로딩 실패 상태
  const [imageError, setImageError] = useState(false);

  // 찜 상태 (검색 결과용)
  const [isWished, setIsWished] = useState<boolean>(
    'isWished' in book ? (book.isWished ?? false) : false,
  );

  // 찜 토글 로딩 상태
  const [isTogglingWish, setIsTogglingWish] = useState(false);

  // book.isWished가 변경되면 로컬 상태도 동기화
  useEffect(() => {
    if ('isWished' in book && book.isWished !== undefined) {
      setIsWished(book.isWished);
    }
  }, [book]);

  /**
   * 이미지 로딩 실패 시 플레이스홀더 표시
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * 찜 하트 버튼 클릭 핸들러
   */
  const handleHeartClick = async () => {
    if (onToggleWish && !isTogglingWish) {
      setIsTogglingWish(true);
      try {
        const newWishStatus = await onToggleWish(book.isbn);
        setIsWished(newWishStatus);
      } catch (error) {
        console.error('[BookCard] Failed to toggle wishlist:', error);
      } finally {
        setIsTogglingWish(false);
      }
    }
  };

  return (
    <div
      className={clsx(
        styles.bookCard,
        // 완독한 책은 투명 효과 적용
        isReadBook(book) &&
          book.readStatus === 'COMPLETED' &&
          styles.completedCard,
      )}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* 책 표지 이미지 */}
      <div className={styles.coverWrapper}>
        {imageError ? (
          // 이미지 로딩 실패 시 플레이스홀더
          <div className={styles.coverPlaceholder}>📚</div>
        ) : (
          // 정상 이미지 표시
          <img
            src={'coverImage' in book ? book.coverImage : book.coverUrl}
            alt={book.title}
            className={styles.coverImage}
            onError={handleImageError}
            loading="lazy" // 지연 로딩
          />
        )}

        {/* 읽기 상태 배지 (읽은 책만 - 이미지 위에 오버레이) */}
        {isReadBook(book) && (
          <>
            {book.readStatus === 'READING' ? (
              // 읽는 중: 상단에 배지
              <div className={styles.readingBadge}>📖 읽는 중</div>
            ) : (
              // 완독: 중앙에 도장 스타일
              <div className={styles.completedStamp}>
                ✓<br />
                완독
              </div>
            )}
          </>
        )}
      </div>

      {/* 책 정보 */}
      <div className={styles.bookInfo}>
        {/* 제목 */}
        <div className={styles.bookTitle} title={book.title}>
          {book.title}
        </div>

        {/* 저자 */}
        <div className={styles.bookMeta} title={book.author}>
          {book.author}
        </div>

        {/* 출판사 (Book 타입에는 없을 수 있음) */}
        {'publisher' in book && (
          <div className={styles.bookMeta} title={book.publisher}>
            {book.publisher}
          </div>
        )}
      </div>

      {/* 찜 하트 버튼 */}
      {showWishButton && onToggleWish && (
        <div className={styles.heartOverlayWrapper}>
          <HeartButton
            isWished={isWished}
            onClick={handleHeartClick}
            disabled={isTogglingWish}
          />
        </div>
      )}
    </div>
  );
};
