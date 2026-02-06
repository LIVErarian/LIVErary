import { useState } from 'react';

import { updateBookStatus } from '@/api/book.api';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { useUserBooks } from '@/hooks/queries/useUser';
import { useModalStore } from '@/store/useModalStore';
import { useReadingStore } from '@/store/useReadingStore';

import * as styles from './BookSelectionModal.css';

export const BookSelectionModal = () => {
  const { currentModal, modalProps, closeModal } = useModalStore();
  const isOpen = currentModal === 'bookSelection';
  const isChanging = modalProps?.isChanging || false;

  const { startReading, updateBook } = useReadingStore();
  const { data: booksData } = useUserBooks('READING', 0, 10);

  const [selectedIsbn, setSelectedIsbn] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

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

  const books = booksData?.content || [];

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={closeModal}
      title={isChanging ? '책 변경하기' : '읽을 책 선택'}
      width="500px"
    >
      <div className={styles.container}>
        <p className={styles.description}>
          {isChanging
            ? '읽을 책을 변경하시겠습니까?'
            : '독서를 시작할 책을 선택해주세요.'}
        </p>

        {isChanging && (
          <div className={styles.completionCheck}>
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

        <div className={styles.bookList}>
          {books.length === 0 && (
            <div className={styles.emptyState}>
              "읽는 중" 상태인 책이 없습니다.
            </div>
          )}

          {books.map((book) => (
            <div
              key={book.isbn}
              className={`${styles.bookItem} ${selectedIsbn === book.isbn ? styles.bookItemSelected : ''}`}
              onClick={() => setSelectedIsbn(book.isbn)}
            >
              {book.coverImage && (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className={styles.bookCover}
                />
              )}
              <div className={styles.bookInfo}>
                <div className={styles.bookTitle}>{book.title}</div>
                <div className={styles.bookAuthor}>{book.author}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
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
