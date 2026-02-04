/**
 * BookCard 컴포넌트
 *
 * 개별 책 정보를 카드 형태로 표시하는 컴포넌트
 * 찜한 책 / 읽은 책 목록에서 재사용됩니다.
 */
import { useState } from 'react';
import clsx from 'clsx'; // className 조합 유틸리티

import type { Book } from '@/types/book.types';
import type { ReadBook, WishedBook } from '@/types/bookshelf.types';

import * as styles from './BookCard.css';

// ============================================
// Props 타입 정의
// ============================================

/**
 * BookCard 컴포넌트 Props
 * - book: WishedBook, ReadBook 또는 Book (검색 결과용)
 * - onRemoveWish: 찜 취소 콜백 (찜한 책에서만 사용)
 */
interface BookCardProps {
  book: WishedBook | ReadBook | Book;
  onRemoveWish?: (id: string) => void; // Optional: 찜한 책에서만 필요
}

// ============================================
// 타입 가드 함수
// ============================================

/**
 * ReadBook 타입인지 확인하는 타입 가드
 * readStatus 속성이 있으면 ReadBook으로 판단
 */
const isReadBook = (book: WishedBook | ReadBook | Book): book is ReadBook => {
  return 'readStatus' in book;
};

/**
 * WishedBook 타입인지 확인하는 타입 가드
 */
const isWishedBook = (
  book: WishedBook | ReadBook | Book,
): book is WishedBook => {
  return 'wishId' in book && !('readStatus' in book);
};

// ============================================
// BookCard 컴포넌트
// ============================================

export const BookCard = ({ book, onRemoveWish }: BookCardProps) => {
  // 이미지 로딩 실패 상태
  const [imageError, setImageError] = useState(false);

  // ============================================
  // 이벤트 핸들러
  // ============================================

  /**
   * 이미지 로딩 실패 시 플레이스홀더 표시
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * 찜 하트 버튼 클릭 핸들러
   * - 이벤트 버블링 방지 (카드 클릭 이벤트와 분리)
   * - WishedBook인 경우에만 wishId 전달
   */
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지

    if (onRemoveWish && isWishedBook(book)) {
      // WishedBook인 경우 wishId 전달
      onRemoveWish(book.wishId);
    }
  };

  // ============================================
  // 렌더링
  // ============================================

  return (
    <div
      className={clsx(
        styles.bookCard,
        // 완독한 책은 투명 효과 적용
        isReadBook(book) &&
          book.readStatus === 'COMPLETED' &&
          styles.completedCard,
      )}
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

        {/* 찜 하트 버튼 (찜한 책에서만 표시 - 이미지 하단에 겹침) */}
        {onRemoveWish && isWishedBook(book) && (
          <button
            className={styles.heartButton}
            onClick={handleHeartClick}
            title="찜 취소"
            type="button"
          >
            {/* 픽셀 아트 하트 */}
            <div className={styles.pixelHeart} />
          </button>
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
    </div>
  );
};
