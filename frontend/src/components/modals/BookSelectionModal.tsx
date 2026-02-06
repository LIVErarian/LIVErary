import { useState } from 'react';

import { updateBookStatus } from '@/api/book.api';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useUserBooks } from '@/hooks/queries/useUser';
import { useModalStore } from '@/store/useModalStore';
import { useReadingStore } from '@/store/useReadingStore';

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
  sectionLabel,
} from './BookSelectionModal.css';

export const BookSelectionModal = () => {
  const { currentModal, modalProps, closeModal, openModal } = useModalStore();
  const isOpen = currentModal === 'bookSelection';
  const isChanging = modalProps?.isChanging || false;

  const {
    startReading,
    updateBook,
    currentBook: readingStoreBook,
  } = useReadingStore();
  const { data: booksData } = useUserBooks('READING', 0, 10);

  const [selectedIsbn, setSelectedIsbn] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // 현재 읽고 있는 책의 전체 정보를 booksData에서 찾음
  const currentBookInfoData = readingStoreBook
    ? booksData?.content.find((b) => b.isbn === readingStoreBook.isbn)
    : null;

  const handleConfirm = async () => {
    if (!selectedIsbn) {
      alert('책을 선택해주세요!');
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

  if (!isOpen) return null;

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
      isOpen={isOpen}
      onClose={closeModal}
      title={isChanging ? '책 변경하기' : '읽을 책 선택'}
      width="500px"
    >
      <div className={container}>
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

        <div className={bookList}>
          {/* 새 책 추가 버튼 */}
          <div
            className={addBookButton}
            onClick={() => {
              closeModal();
              openModal('bookSearch');
            }}
          >
            <span className={addIcon}>+</span>
            <span>새로운 책 검색하기</span>
          </div>

          {books.length === 0 && (
            <div className={emptyState}>"읽는 중" 상태인 책이 없습니다.</div>
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
      </div>
    </PixelModal>
  );
};
