import { useState } from 'react';

import { updateBookStatus } from '@/api/book.api';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useRegisterReadingBook } from '@/hooks/queries/useBook';
import { useUserBooks } from '@/hooks/queries/useUser';
import { useModalStore } from '@/store/useModalStore';
import { useReadingStore } from '@/store/useReadingStore';
import { BookSearchModal } from './BookSearchModal';

import type { Book } from '@/types/book.types';

import {
  addBookButton,
  addIcon,
  bookAuthor,
  bookCover,
  bookInfo,
  bookItem,
  bookItemSelected,
  bookList,
  bookTitle,
  completionCheck,
  container,
  currentBookAuthor,
  currentBookCover,
  currentBookDetails,
  currentBookInfo,
  currentBookSection,
  currentBookTitle,
  description,
  emptyState,
  footer,
  searchHeader,
  searchTitle,
  searchViewContainer,
  sectionLabel,
} from './BookSelectionModal.css.ts';

type ViewMode = 'list' | 'search';

interface BookSelectionModalProps {
  isChanging?: boolean;
}

export const BookSelectionModal = ({
  isChanging = false,
}: BookSelectionModalProps) => {
  const { closeModal, openModal } = useModalStore();

  const {
    startReading,
    updateBook,
    currentBook: readingStoreBook,
  } = useReadingStore();
  const { data: booksData } = useUserBooks('READING', 0, 10);
  const { mutateAsync: registerReading } = useRegisterReadingBook();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIsbn, setSelectedIsbn] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // 현재 읽고 있는 책의 전체 정보를 booksData에서 찾음
  const currentBookInfoData = readingStoreBook
    ? booksData?.content.find((b) => b.isbn === readingStoreBook.isbn)
    : null;

  const handleConfirm = async () => {
    if (!selectedIsbn) {
      openModal('alert', { title: '알림', message: '책을 선택해주세요!' });
      return;
    }

    const book = booksData?.content.find((b) => b.isbn === selectedIsbn);
    if (!book) return;

    if (isChanging && isCompleted) {
      await updateBookStatus(selectedIsbn, 'COMPLETED');
    }

    if (isChanging) {
      updateBook({ isbn: book.isbn, title: book.title });
    } else {
      startReading({ isbn: book.isbn, title: book.title });
    }

    closeModal();
  };

  /**
   * 검색 뷰에서 책 선택 시 처리
   */
  const handleSelectBookFromSearch = async (book: Book) => {
    try {
      await registerReading(book.isbn);
      openModal('alert', { title: '성공', message: '목록에 추가되었습니다.' });
      setViewMode('list');
    } catch (error) {
      console.error('Failed to add book:', error);
      openModal('alert', { title: '오류', message: '책 추가에 실패했습니다.' });
    }
  };

  let books = booksData?.content || [];

  // 책 변경 시 현재 읽고 있는 책은 리스트에서 제외
  if (isChanging) {
    const { currentBook } = useReadingStore.getState();
    if (currentBook) {
      books = books.filter((b) => b.isbn !== currentBook.isbn);
    }
  }

  return (
    <PixelModal
      isOpen={true}
      onClose={closeModal}
      title={isChanging ? '책 변경하기' : '읽을 책 선택'}
      width="500px"
    >
      <div className={container}>
        {viewMode === 'list' ? (
          <>
            <p className={description}>
              {isChanging
                ? '읽을 책을 변경하시겠습니까?'
                : '독서를 시작할 책을 선택해주세요.'}
            </p>

            {isChanging && currentBookInfoData && (
              <div className={currentBookSection}>
                <span className={sectionLabel}>현재 읽고 있는 책</span>
                <div className={currentBookInfo}>
                  {currentBookInfoData.coverUrl && (
                    <img
                      src={currentBookInfoData.coverUrl}
                      alt={currentBookInfoData.title}
                      className={currentBookCover}
                    />
                  )}
                  <div className={currentBookDetails}>
                    <div className={currentBookTitle}>
                      {currentBookInfoData.title}
                    </div>
                    <div className={currentBookAuthor}>
                      {currentBookInfoData.author}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isChanging && (
              <div className={completionCheck}>
                <label>
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                  />
                  <span>이전 책을 다 읽었나요?</span>
                </label>
              </div>
            )}

            {/* 새로운 책 검색 버튼 (스크롤 밖으로 분리) */}
            <div
              className={addBookButton}
              onClick={() => setViewMode('search')}
            >
              <span className={addIcon}>+</span>
              <span>새로운 책 검색하기</span>
            </div>

            <div className={bookList}>
              {books.length === 0 && (
                <div className={emptyState}>
                  "읽는 중" 상태인 책이 없습니다.
                </div>
              )}

              {books.map((book) => (
                <div
                  key={book.isbn}
                  className={`${bookItem} ${selectedIsbn === book.isbn ? bookItemSelected : ''}`}
                  onClick={() => setSelectedIsbn(book.isbn)}
                >
                  {book.coverUrl && (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className={bookCover}
                    />
                  )}
                  <div className={bookInfo}>
                    <div className={bookTitle}>{book.title}</div>
                    <div className={bookAuthor}>{book.author}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={footer}>
              <PixelButton size="sm" variant="beige" onClick={closeModal}>
                취소
              </PixelButton>
              <PixelButton size="sm" variant="primary" onClick={handleConfirm}>
                {isChanging ? '변경 완료' : '등록 완료'}
              </PixelButton>
            </div>
          </>
        ) : (
          <div className={searchViewContainer}>
            <div className={searchHeader}>
              <PixelButton
                variant="beige"
                size="sm"
                onClick={() => setViewMode('list')}
              >
                ← 돌아가기
              </PixelButton>
              <span className={searchTitle}>새로운 책 검색</span>
            </div>
            <BookSearchModal
              onSelectBook={handleSelectBookFromSearch}
              from="bookSelection"
            />
          </div>
        )}
      </div>
    </PixelModal>
  );
};
