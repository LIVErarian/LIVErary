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
import type { UserBook } from '@/types/bookshelf.types';

import * as styles from './BookCard.css';

/**
 * BookCard 컴포넌트 Props
 * - book: UserBook (서재) 또는 Book (검색 결과용)
 * - showWishButton: 찜 버튼 표시 여부
 * - onToggleWish: 찜 토글 콜백
 */
interface BookCardProps {
  book: UserBook | Book;
  showWishButton?: boolean; // Optional: 찜 버튼 표시 여부
  onToggleWish?: (id: string) => Promise<boolean>; // Optional: 찜 토글 (isbn or bookId)
  // Force update
  onClick?: () => void; // Optional: 카드 클릭 이벤트
  onComplete?: (id: string, e: React.MouseEvent) => void; // 완독 처리 핸들러
}

/**
 * UserBook 타입인지 확인하는 타입 가드
 */
const isUserBook = (book: UserBook | Book): book is UserBook => {
  return 'status' in book;
};

export const BookCard = ({
  book,
  showWishButton,
  onToggleWish,
  onClick,
  onComplete,
}: BookCardProps) => {
  // 이미지 로딩 실패 상태
  const [imageError, setImageError] = useState(false);

  // 찜 상태 (검색 결과용 OR 서재용)
  const [isWished, setIsWished] = useState<boolean>(() => {
    if ('isWished' in book) return book.isWished ?? false;
    if ('status' in book) return book.status === 'WISH';
    return false;
  });

  // 찜 토글 로딩 상태
  const [isTogglingWish, setIsTogglingWish] = useState(false);

  // book props가 변경되면 로컬 상태도 동기화
  useEffect(() => {
    if ('isWished' in book && book.isWished !== undefined) {
      setIsWished(book.isWished);
    } else if ('status' in book) {
      setIsWished(book.status === 'WISH');
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
        let id: string;
        if ('isbn' in book && book.isbn) {
          id = book.isbn;
        } else if ('bookId' in book) {
          // UserBook fallback
          id = book.bookId;
        } else {
          // Should not happen for Book (has isbn)
          id = '';
        }

        if (id) {
          // 1. 즉시 로컬 상태 변경 (Optimistic UI)
          setIsWished((prev) => !prev);

          // 2. 부모 핸들러 호출 (API 요청)
          await onToggleWish(id);
        }
      } catch (error) {
        console.error('[BookCard] Failed to toggle wishlist:', error);
        // 에러 시 로컬 상태 복구
        setIsWished((prev) => !prev);
      } finally {
        setIsTogglingWish(false);
      }
    }
  };

  // 책 표지 URL 결정
  const coverUrl = book.coverUrl;

  return (
    <div
      className={clsx(
        styles.bookCard,
        // 완독한 책은 투명 효과 적용
        isUserBook(book) && book.status === 'COMPLETED' && styles.completedCard,
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
            src={coverUrl}
            alt={book.title}
            className={styles.coverImage}
            onError={handleImageError}
            loading="lazy" // 지연 로딩
          />
        )}

        {/* 읽기 상태 배지 (읽은 책만 - 이미지 위에 오버레이) */}
        {isUserBook(book) && (
          <>
            {book.status === 'READING' ? (
              // 읽는 중: 상단에 배지 + 호버 시 완독 버튼
              <>
                <div className={styles.readingBadge}>📖 읽는 중</div>
                {onComplete && (
                  <div className={styles.completeOverlay}>
                    <button
                      className={styles.completeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        // isbn이 있으면 isbn, 없으면 bookId 사용
                        const id = book.isbn || book.bookId;
                        onComplete(id, e);
                      }}
                    >
                      완독하기
                    </button>
                  </div>
                )}
              </>
            ) : book.status === 'COMPLETED' ? (
              // 완독: 중앙에 도장 스타일
              <div className={styles.completedStamp}>
                ✓<br />
                완독
              </div>
            ) : null}
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

        {/* 출판사 (Book 타입에는 있지만 UserBook에는 없음) */}
        {'publisher' in book && book.publisher && (
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
