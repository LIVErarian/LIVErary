/**
 * BookSearchModal 컴포넌트
 *
 * 책 검색 모달
 * - 키워드 검색
 * - 검색 결과 3열 그리드 표시
 * - 페이지네이션
 */

import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import { useSearchBook } from '@/hooks/queries/useBook';
import { BookCard } from '../book/BookCard';

import * as styles from './BookSearchModal.css';

export const BookSearchModal = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keyword, setKeyword] = useState('');

  // 서버 페이지 (20개씩)
  const [serverPage, setServerPage] = useState(0);

  // 클라이언트 페이지 (6개씩)
  const [clientPage, setClientPage] = useState(0);

  const SERVER_PAGE_SIZE = 20; // 서버에서 한 번에 가져올 개수
  const CLIENT_PAGE_SIZE = 6; // 화면에 표시할 개수 (2줄 x 3권)

  // 실제 API 호출 (서버 페이지 단위로)
  const { data, isLoading, isError } = useSearchBook(
    searchKeyword,
    serverPage,
    SERVER_PAGE_SIZE,
  );

  const handleSearch = () => {
    if (!keyword.trim()) return;
    setSearchKeyword(keyword);
    setServerPage(0);
    setClientPage(0); // 검색 시 첫 페이지로 이동
  };

  const handleReset = () => {
    setKeyword('');
    setSearchKeyword('');
    setServerPage(0);
    setClientPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 현재 서버 응답에서 보여줄 책들
  const allBooks = data?.content || [];

  // 클라이언트 페이지네이션: 현재 페이지에 보여줄 6개
  const startIdx =
    (clientPage % Math.ceil(SERVER_PAGE_SIZE / CLIENT_PAGE_SIZE)) *
    CLIENT_PAGE_SIZE;
  const endIdx = startIdx + CLIENT_PAGE_SIZE;
  const booksToShow = allBooks.slice(startIdx, endIdx);

  // 전체 페이지 계산
  const totalBooks = data?.totalElements || 0;
  const totalClientPages = Math.ceil(totalBooks / CLIENT_PAGE_SIZE);

  const hasSearched = !!searchKeyword;

  const handlePrevPage = () => {
    if (clientPage > 0) {
      const newClientPage = clientPage - 1;
      setClientPage(newClientPage);

      // 이전 서버 페이지로 넘어가야 하는 경우
      const newServerPage = Math.floor(
        (newClientPage * CLIENT_PAGE_SIZE) / SERVER_PAGE_SIZE,
      );
      if (newServerPage !== serverPage) {
        setServerPage(newServerPage);
      }
    }
  };

  const handleNextPage = () => {
    if (clientPage < totalClientPages - 1) {
      const newClientPage = clientPage + 1;
      setClientPage(newClientPage);

      // 다음 서버 페이지로 넘어가야 하는 경우
      const newServerPage = Math.floor(
        (newClientPage * CLIENT_PAGE_SIZE) / SERVER_PAGE_SIZE,
      );
      if (newServerPage !== serverPage) {
        setServerPage(newServerPage);
      }
    }
  };

  return (
    <div className={styles.modalContainer}>
      {/* 검색창 영역 */}
      <div className={styles.searchContainer}>
        <PixelInput
          placeholder="책 제목, 저자, 출판사 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
          fullWidth
        />
        <PixelButton
          onClick={handleSearch}
          className={styles.searchButton}
          variant="beige"
          disabled={!keyword.trim()}
        >
          검색
        </PixelButton>
        <PixelButton
          onClick={handleReset}
          className={styles.searchButton}
          variant="beige"
          disabled={!keyword.trim()}
        >
          초기화
        </PixelButton>
      </div>

      {/* 컨텐츠 영역 */}
      <div className={styles.contentArea}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <div className={styles.emptyText}>검색 중...</div>
          </div>
        ) : isError ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>❌</div>
            <div className={styles.emptyText}>검색 중 오류가 발생했습니다</div>
          </div>
        ) : !hasSearched ? (
          // 검색 전 초기 상태
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <div className={styles.emptyText}>책을 검색해보세요</div>
          </div>
        ) : booksToShow.length === 0 ? (
          // 검색 결과 없음
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <div className={styles.emptyText}>검색 결과가 없습니다</div>
          </div>
        ) : (
          // 검색 결과 목록
          <div className={styles.booksGrid}>
            {booksToShow.map((book) => (
              <BookCard key={book.isbn} book={book} />
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className={styles.paginationContainer}>
        <PixelButton
          size="sm"
          variant={clientPage === 0 ? 'disabled' : 'beige'}
          disabled={clientPage === 0 || isLoading}
          onClick={handlePrevPage}
        >
          ◀ 이전
        </PixelButton>

        <div className={styles.pageInfo}>
          {clientPage + 1} / {totalClientPages || 1}
        </div>

        <PixelButton
          size="sm"
          variant={clientPage >= totalClientPages - 1 ? 'disabled' : 'beige'}
          disabled={clientPage >= totalClientPages - 1 || isLoading}
          onClick={handleNextPage}
        >
          다음 ▶
        </PixelButton>
      </div>
    </div>
  );
};
