/**
 * BookshelfModal 컴포넌트
 *
 * 나의 서재 모달
 * - 찜한 책 목록 조회 및 찜 취소 (하트 버튼)
 * - 읽은 책 목록 조회
 * - 8권씩 페이지네이션 처리
 */

import { useState } from 'react';
import clsx from 'clsx';

import { PixelButton } from '@/components/common/PixelButton';
// Mock 데이터 (임시)
import { MOCK_READ_BOOKS, MOCK_WISHED_BOOKS } from '@/mocks/bookshelfData';
import { BookCard } from '../book/BookCard';

import * as styles from './BookshelfModal.css';

const BOOKS_PER_PAGE = 8; // 페이지당 책 개수 (4열 * 2행)

// 탭 타입
type TabType = 'wished' | 'read';

// BookshelfModal 컴포넌트
export const BookshelfModal = () => {
  // 현재 활성 탭 (찜한 책 / 읽은 책)
  const [activeTab, setActiveTab] = useState<TabType>('wished');

  // 현재 페이지 (0부터 시작)
  const [currentPage, setCurrentPage] = useState(0);

  // 책 데이터 (임시로 Mock 데이터 사용)
  // TODO: React Query로 대체 예정
  const [wishedBooks, setWishedBooks] = useState(MOCK_WISHED_BOOKS);
  const [readBooks] = useState(MOCK_READ_BOOKS);

  // 현재 탭에 따른 전체 데이터
  const allBooks =
    activeTab === 'wished' ? wishedBooks.content : readBooks.content;

  // 페이지네이션 계산
  const totalBooks = allBooks.length;
  const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);

  // 현재 페이지에 표시할 책들만 슬라이싱
  const startIndex = currentPage * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const currentPageBooks = allBooks.slice(startIndex, endIndex);

  // 이벤트 핸들러
  /**
   * 탭 전환 핸들러
   * - 탭 변경 시 페이지를 0으로 리셋
   */
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(0);
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

  /**
   * 찜 취소 핸들러 (Optimistic UI Update)
   * - 즉시 UI에서 제거 (낙관적 업데이트)
   * - 추후 API 연동 시 실패하면 롤백 처리
   *
   * @param wishId - 취소할 찜 ID
   */
  const handleRemoveWish = (wishId: string) => {
    console.log('찜 취소:', wishId);

    // Optimistic Update: 즉시 UI에서 제거
    setWishedBooks((prev) => ({
      ...prev,
      content: prev.content.filter((book) => book.wishId !== wishId),
    }));

    // 페이지에 책이 없으면 이전 페이지로 이동
    const remainingBooks = wishedBooks.content.length - 1;
    const newTotalPages = Math.ceil(remainingBooks / BOOKS_PER_PAGE);

    if (currentPage >= newTotalPages && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }

    // TODO: API 연동

    alert(`찜 취소: ${wishId}\n(목록에서 제거되었습니다)`);
  };

  /**
   * 책 목록 렌더링
   * - 현재 페이지의 책들만 표시 (8권)
   * - 데이터가 없으면 빈 상태 메시지 표시
   */
  const renderBookList = () => {
    // 빈 상태
    if (totalBooks === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <div className={styles.emptyText}>
            {activeTab === 'wished'
              ? '찜한 책이 없습니다.'
              : '읽은 책이 없습니다.'}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.booksGrid}>
        {currentPageBooks.map((book) => (
          <BookCard
            key={
              // WishedBook이면 wishId, ReadBook이면 readHistoryId 사용
              'wishId' in book ? book.wishId : book.readHistoryId
            }
            book={book}
            // 찜한 책 탭에서만 찜 취소 콜백 전달
            onRemoveWish={activeTab === 'wished' ? handleRemoveWish : undefined}
          />
        ))}
      </div>
    );
  };

  /**
   * 페이지네이션 렌더링
   * - 이전/다음 버튼
   * - 현재 페이지 정보
   */
  const renderPagination = () => {
    // 페이지가 0개면 표시 안 함 (책이 없는 경우)
    if (totalPages === 0) return null;

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
      {/* 탭 영역 */}
      <div className={styles.tabContainer}>
        {/* 찜한 책 탭 */}
        <PixelButton
          className={clsx(
            styles.tabButton,
            activeTab === 'wished' && styles.tabActive,
          )}
          onClick={() => handleTabChange('wished')}
        >
          찜한 책
        </PixelButton>

        {/* 읽은 책 탭 */}
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

      {/* 책 목록 영역 */}
      <div className={styles.contentArea}>{renderBookList()}</div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};
