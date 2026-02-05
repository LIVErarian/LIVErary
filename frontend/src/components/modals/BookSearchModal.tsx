import React, { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import { PixelPagination } from '@/components/common/PixelPagination';
import { useSearchBook, useToggleWishlist } from '@/hooks/queries/useBook';
import { type ModalType, useModalStore } from '@/store/useModalStore';
import { BookCard } from '../book/BookCard';

import type { Book } from '@/types/book.types';

import * as styles from './BookSearchModal.css';

const ITEMS_PER_PAGE = 6;
const FETCH_SIZE = 20;

interface BookSearchModalProps {
  onSelectBook?: (book: Book) => void | Promise<void>;
  // If provided, the modal acts as a selector
  from?: ModalType;
}

export const BookSearchModal = ({
  onSelectBook,
  from = 'bookSearch',
}: BookSearchModalProps) => {
  // 검색어 입력 상태
  const [searchQuery, setSearchQuery] = useState('');
  // 실제 검색 키워드
  const [keyword, setKeyword] = useState('');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);

  // API Query Hook
  const {
    data: searchResult,
    isLoading,
    isError,
  } = useSearchBook(keyword, 0, FETCH_SIZE);
  const { mutateAsync: toggleWishlist } = useToggleWishlist();

  // 상세 보기 모달 상태 (ISBN 저장)
  // const [selectedIsbn, setSelectedIsbn] = useState<string | null>(null);
  const { openModal } = useModalStore();

  // 검색 결과 데이터
  const books = searchResult?.content || [];
  const totalBooks = books.length;
  const totalPages = Math.ceil(totalBooks / ITEMS_PER_PAGE);

  // 검색 모드 여부 (키워드가 있으면 검색 모드)
  const isSearchMode = !!keyword;

  /**
   * 검색 실행
   */
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setKeyword(searchQuery);
    setCurrentPage(0); // 검색 시 페이지 초기화
  };

  /**
   * 검색 초기화
   */
  const handleClearSearch = () => {
    setSearchQuery('');
    setKeyword('');
    setCurrentPage(0); // 초기화 시 페이지 0
  };

  /**
   * Enter 키 처리
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * 페이지 이동 핸들러
   */
  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  /**
   * 현재 페이지 데이터 슬라이싱 및 매핑
   */
  const getCurrentPageBooks = () => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return books.slice(startIndex, endIndex);
  };

  /**
   * 찜 토글 핸들러
   */
  const handleToggleWish = async (isbn: string): Promise<boolean> => {
    try {
      const result = await toggleWishlist(isbn);
      return result.wished;
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      throw error;
    }
  };

  /**
   * 책 클릭 핸들러 (상세 모달 열기 또는 선택)
   */
  const handleBookClick = (book: Book) => {
    if (onSelectBook) {
      onSelectBook(book);
    } else {
      openModal('bookDetail', {
        isbn: book.isbn,
        initialIsWished: book.isWished,
        from,
      });
    }
  };

  const currentBooks = getCurrentPageBooks();

  /**
   * 책 목록 렌더링
   */
  const renderBookList = () => {
    // 1. 검색 전 (초기 상태)
    if (!isSearchMode) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <div className={styles.emptyText}>
            책 제목이나 저자로 검색해보세요.
          </div>
        </div>
      );
    }

    // 2. 로딩 중
    if (isLoading) {
      return <div className={styles.loadingContainer}>Loading...</div>;
    }

    // 3. 에러 발생
    if (isError) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <div className={styles.emptyText}>검색 중 오류가 발생했습니다.</div>
        </div>
      );
    }

    // 4. 검색 결과 없음
    if (totalBooks === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <div className={styles.emptyText}>검색 결과가 없습니다.</div>
        </div>
      );
    }

    // 5. 결과 목록 표시
    return (
      <div className={styles.booksGrid}>
        {currentBooks.map((book) => (
          <BookCard
            key={book.isbn} // ISBN을 키로 사용
            book={book}
            showWishButton={true}
            onToggleWish={handleToggleWish}
            onClick={() => handleBookClick(book)}
          />
        ))}
      </div>
    );
  };

  /**
   * 페이지네이션 렌더링
   */
  /**
   * 페이지네이션 렌더링
   */
  const renderPagination = () => {
    if (!isSearchMode || totalBooks === 0 || isLoading) return null;

    return (
      <PixelPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    );
  };

  return (
    <div className={styles.modalContainer}>
      {/* 검색 영역 */}
      <div className={styles.searchContainer}>
        <PixelInput
          className={styles.searchInput}
          placeholder="책 제목이나 저자를 입력하세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <PixelButton
          className={styles.searchButton}
          variant="primary"
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
        >
          검색
        </PixelButton>
        {isSearchMode && (
          <PixelButton
            className={styles.searchButton}
            variant="beige"
            onClick={handleClearSearch}
          >
            초기화
          </PixelButton>
        )}
      </div>

      {/* 컨텐츠 영역 */}
      <div className={styles.contentArea}>{renderBookList()}</div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};
