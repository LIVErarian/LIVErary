/**
 * BookshelfModal 컴포넌트
 *
 * 나의 서재 모달
 * - 찜한 책 / 읽고 있는 책 / 읽은 책 목록 조회
 * - 6권씩 페이지네이션 처리
 * - 책 추가 기능 (검색 후 추가)
 */

import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { userApi } from '@/api/user.api';
import { PixelButton } from '@/components/common/PixelButton';
import { useToggleWishlist } from '@/hooks/queries/useBook';
import { BookCard } from '../book/BookCard';
import { BookSearchModal } from './BookSearchModal';

import type { Book } from '@/types/book.types';
import type { UserBook, UserBookStatus } from '@/types/bookshelf.types';

import * as styles from './BookshelfModal.css';

const BOOKS_PER_PAGE = 6;

// 탭 타입
type TabType = 'wished' | 'reading' | 'read';

// 뷰 모드 타입
type ViewMode = 'list' | 'search';

// BookshelfModal 컴포넌트
export const BookshelfModal = () => {
  // 현재 활성 탭
  const [activeTab, setActiveTab] = useState<TabType>('wished');
  // 뷰 모드 (목록 / 검색)
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // 현재 페이지 (0부터 시작)
  const [currentPage, setCurrentPage] = useState(0);

  // 데이터 상태
  const [books, setBooks] = useState<UserBook[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // API 호출
  const fetchBooks = async (tab: TabType, page: number) => {
    setIsLoading(true);
    try {
      let status: UserBookStatus;
      switch (tab) {
        case 'wished':
          status = 'WISH';
          break;
        case 'reading':
          status = 'PENDING';
          break;
        case 'read':
          status = 'COMPLETED';
          break;
      }

      const response = await userApi.getUserBooks(status, page, BOOKS_PER_PAGE);
      setBooks(response.content);
      setTotalBooks(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('책 목록을 불러오는데 실패했습니다:', error);
      setBooks([]);
      setTotalBooks(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 탭이나 페이지, 뷰 모드 변경 시 데이터 로드
  useEffect(() => {
    if (viewMode === 'list') {
      fetchBooks(activeTab, currentPage);
    }
  }, [activeTab, currentPage, viewMode]);

  // 이벤트 핸들러
  /**
   * 탭 전환 핸들러
   * - 탭 변경 시 페이지를 0으로 리셋하고 목록 뷰로 전환
   */
  const handleTabChange = (tab: TabType) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setCurrentPage(0);
      setViewMode('list');
    }
  };

  /**
   * 이전 페이지로 이동
   */
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  /**
   * 다음 페이지로 이동
   */
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // 찜 토글 훅
  const { mutateAsync: toggleWish } = useToggleWishlist();

  /**
   * 찜 토글 핸들러 (목록 뷰에서 사용)
   */
  const handleToggleWish = async (id: string): Promise<boolean> => {
    // 찜 목록에서만 삭제 ui 업데이트
    if (activeTab === 'wished') {
      try {
        setBooks((prev) =>
          prev.filter((book) => {
            if (book.isbn && book.isbn === id) return false;
            if (book.bookId === id) return false;
            return true;
          }),
        );
        setTotalBooks((prev) => Math.max(0, prev - 1));

        const response = await toggleWish(id);
        return response.wished;
      } catch (e) {
        console.error(e);
        return true;
      }
    } else {
      // 다른 탭에서는 상태만 변경
      try {
        const response = await toggleWish(id);
        return response.wished;
      } catch (e) {
        console.error(e);
        return false;
      }
    }
  };

  /**
   * 책 검색 모달에서 책 선택 시 핸들러
   */
  const handleSelectBookFromSearch = async (book: Book) => {
    try {
      if (activeTab === 'wished') {
        const { wished } = await toggleWish(book.isbn);
        if (wished) {
          alert('찜 목록에 추가되었습니다.');
        } else {
          alert('찜 목록에서 제거되었습니다.');
        }
      } else {
        // 읽고 있는 책 / 읽은 책 추가
        const status = activeTab === 'reading' ? 'PENDING' : 'COMPLETED';
        await userApi.addBook(book.isbn, status);
        alert('책장에 추가되었습니다.');
      }

      // 목록으로 돌아가기 & 새로고침
      setViewMode('list');
      fetchBooks(activeTab, 0); // 첫 페이지로
    } catch (error) {
      console.error(error);
      alert('책 추가에 실패했습니다.');
    }
  };

  /**
   * 책 목록 렌더링
   */
  const renderBookList = () => {
    if (viewMode === 'search') {
      const isWishTab = activeTab === 'wished';
      return (
        <div className={styles.searchViewContainer}>
          <div className={styles.searchHeader}>
            <PixelButton
              onClick={() => setViewMode('list')}
              variant="beige"
              size="sm"
            >
              ← 목록으로
            </PixelButton>
            <span>
              {isWishTab
                ? '찜할 책 검색'
                : activeTab === 'reading'
                  ? '읽고 있는 책 검색'
                  : '읽은 책 검색'}
            </span>
          </div>
          <BookSearchModal
            onSelectBook={!isWishTab ? handleSelectBookFromSearch : undefined}
          />
        </div>
      );
    }

    if (isLoading) {
      return <div className={styles.loadingState}>로딩 중...</div>;
    }

    // 빈 상태 -> 책 추가 유도
    if (totalBooks === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <div className={styles.emptyText}>
            {activeTab === 'wished'
              ? '찜한 책이 없습니다.'
              : activeTab === 'reading'
                ? '읽고 있는 책이 없습니다.'
                : '읽은 책이 없습니다.'}
          </div>
          <PixelButton
            className={styles.addBookButton}
            onClick={() => setViewMode('search')}
          >
            + 책 추가하기
          </PixelButton>
        </div>
      );
    }

    return (
      <div className={styles.bookListWrapper}>
        <div className={styles.toolbar}>
          <PixelButton
            size="sm"
            onClick={() => setViewMode('search')}
            className={styles.addButtonSmall}
          >
            + 책 추가
          </PixelButton>
        </div>
        <div className={styles.booksGrid}>
          {books.map((book) => (
            <BookCard
              key={book.bookId}
              book={book}
              showWishButton={activeTab === 'wished'}
              onToggleWish={handleToggleWish}
            />
          ))}
        </div>
      </div>
    );
  };

  /**
   * 페이지네이션 렌더링
   */
  const renderPagination = () => {
    // 검색 모드거나 책이 없으면 표시 안 함
    if (viewMode === 'search' || totalPages === 0) return null;

    return (
      <div className={styles.paginationContainer}>
        {/* 이전 페이지 버튼 */}
        <PixelButton
          size="sm"
          variant={currentPage === 0 || totalPages <= 1 ? 'disabled' : 'beige'}
          onClick={handlePrevPage}
          disabled={currentPage === 0 || totalPages <= 1}
        >
          ◀ 이전
        </PixelButton>

        {/* 페이지 정보 */}
        <div className={styles.pageInfo}>
          {currentPage + 1} / {totalPages}
        </div>

        {/* 다음 페이지 버튼 */}
        <PixelButton
          size="sm"
          variant={
            currentPage === totalPages - 1 || totalPages <= 1
              ? 'disabled'
              : 'beige'
          }
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1 || totalPages <= 1}
        >
          다음 ▶
        </PixelButton>
      </div>
    );
  };

  return (
    <div className={styles.modalContainer}>
      {/* 탭 영역 (리스트 뷰일 때만 표시 or 검색 시에도 유지?) -> 검색 시에는 숨기거나 비활성 */}
      {viewMode === 'list' && (
        <div className={styles.tabContainer}>
          <PixelButton
            className={clsx(
              styles.tabButton,
              activeTab === 'wished' && styles.tabActive,
            )}
            onClick={() => handleTabChange('wished')}
          >
            찜한 책
          </PixelButton>

          <PixelButton
            className={clsx(
              styles.tabButton,
              activeTab === 'reading' && styles.tabActive,
            )}
            onClick={() => handleTabChange('reading')}
          >
            읽고 있는 책
          </PixelButton>

          <PixelButton
            className={clsx(
              styles.tabButton,
              activeTab === 'read' && styles.tabActive,
            )}
            onClick={() => handleTabChange('read')}
          >
            읽은 책
          </PixelButton>
        </div>
      )}

      {/* 책 목록 영역 */}
      <div className={styles.contentArea}>{renderBookList()}</div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};
