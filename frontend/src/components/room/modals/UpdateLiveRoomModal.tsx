import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { searchBook } from '@/api/book.api';
import { categoryApi } from '@/api/category.api';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import { useDebounce } from '@/hooks/common/useDebounce';
import { useUpdateLiveRoom } from '@/services/mutations/useRoomMutations';
import { useModalStore } from '@/store/useModalStore';

import type { Book } from '@/types/book.types';

import * as styles from './CreateRoomModal.css';

export const UpdateLiveRoomModal = () => {
  const { modalProps, closeModal, openModal } = useModalStore();
  const room = modalProps.editRoom?.room;
  const { mutate: updateRoom, isPending } = useUpdateLiveRoom();
  const queryClient = useQueryClient();

  // --- 상태 관리 ---
  const [title, setTitle] = useState(room?.title || '');
  const [maxUser, setMaxUser] = useState(room?.maxUser || 4);
  const [categoryId, setCategoryId] = useState('');

  // 책 검색 관련
  const [bookSearchKeyword, setBookSearchKeyword] = useState('');

  // useState 초기화 함수로 로직 이동
  const [selectedBook, setSelectedBook] = useState<{
    title: string;
    author: string;
    coverUrl: string;
    isbn?: string;
  } | null>(() => {
    if (room?.bookTitle) {
      return {
        title: room.bookTitle,
        author: room.bookAuthor || '',
        coverUrl: room.bookCoverUrl || '',
        isbn: undefined,
      };
    }
    return null;
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debouncedKeyword = useDebounce(bookSearchKeyword, 300);

  // --- 데이터 로드 ---
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategoryList,
  });

  const { data: bookSearchResults, isLoading: isSearchingBooks } = useQuery({
    queryKey: ['bookSearchDropdown', debouncedKeyword],
    queryFn: () => searchBook(debouncedKeyword, 0, 10),
    enabled: !!debouncedKeyword && debouncedKeyword.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  // 렌더링 시점에 매칭되는 카테고리 ID 계산 (Derived State)
  // 사용자가 선택한 값(categoryId)이 있으면 그것을 쓰고,
  // 없으면(초기 상태) 기존 방 정보와 일치하는 카테고리를 찾아서 씀
  const matchedCategory = categories.find((c) => c.name === room?.categoryName);
  const finalCategoryId = categoryId || matchedCategory?.categoryId || '';

  // 바깥 클릭 시 검색창 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setBookSearchKeyword('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!room) return null;

  // --- 핸들러 ---
  const handleBookSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookSearchKeyword(e.target.value);
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      coverUrl: book.coverUrl,
    });
    setBookSearchKeyword('');

    if (categories.length > 0) {
      const matched = categories.find(
        (c) => book.category.includes(c.name) || c.name.includes(book.category),
      );
      if (matched) setCategoryId(matched.categoryId);
    }
  };

  const handleRemoveBook = () => {
    setSelectedBook(null);
    setBookSearchKeyword('');
  };

  const handleMaxUserBtn = (delta: number) => {
    const next = maxUser + delta;
    if (next >= room.currentCount && next <= 20) setMaxUser(next);
  };

  const handleMaxUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    if (val > 20) setMaxUser(20);
    else setMaxUser(val);
  };

  const handleMaxUserBlur = () => {
    if (maxUser < room.currentCount) setMaxUser(room.currentCount);
  };

  const handleSubmit = () => {
    if (!title.trim())
      return openModal('alert', {
        title: '오류',
        message: '방 제목을 입력해주세요.',
      });
    if (!finalCategoryId)
      return openModal('alert', {
        title: '오류',
        message: '카테고리를 선택해주세요.',
      });

    const originalCategory = categories.find(
      (c) => c.name === room.categoryName,
    );
    const originalCategoryId = originalCategory?.categoryId;
    const isCategoryChanged = finalCategoryId !== originalCategoryId;
    const isBookChanged = !!selectedBook?.isbn;

    updateRoom(
      {
        roomId: room.roomId,
        title: title,
        maxUser: maxUser,
        categoryId: isCategoryChanged ? finalCategoryId : undefined,
        isbn: isBookChanged ? selectedBook?.isbn : undefined,
      },
      {
        onSuccess: () => {
          closeModal();
          queryClient.invalidateQueries({ queryKey: ['room', room.roomId] });
          queryClient.invalidateQueries({ queryKey: ['rooms'] });

          setTimeout(() => {
            openModal('alert', {
              title: '성공',
              message: '방 정보가 수정되었습니다.',
            });
          }, 100);
        },
      },
    );
  };

  // --- 렌더링 ---
  let dropdownContent = null;
  if (debouncedKeyword && debouncedKeyword.length >= 2) {
    if (isSearchingBooks) {
      dropdownContent = (
        <div className={styles.dropdownMessage}>검색 중...</div>
      );
    } else if (
      bookSearchResults?.content &&
      bookSearchResults.content.length > 0
    ) {
      dropdownContent = (
        <>
          {bookSearchResults.content.map((book: Book) => (
            <div
              key={book.isbn}
              className={styles.searchResultItem}
              onClick={() => handleBookSelect(book)}
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                className={styles.bookThumbnail}
              />
              <div className={styles.searchResultInfo}>
                <div className={styles.searchResultTitle}>{book.title}</div>
                <div className={styles.searchResultAuthor}>{book.author}</div>
              </div>
            </div>
          ))}
        </>
      );
    } else {
      dropdownContent = (
        <div className={styles.dropdownMessage}>검색 결과가 없습니다.</div>
      );
    }
  }

  let bookSelectionUI;
  if (!selectedBook) {
    bookSelectionUI = (
      <div className={styles.bookSelectContainer} ref={searchContainerRef}>
        <PixelInput
          placeholder="책 제목이나 저자를 입력하세요"
          value={bookSearchKeyword}
          onChange={handleBookSearchChange}
          fullWidth
        />
        {dropdownContent && (
          <div className={styles.searchResultsDropdown}>{dropdownContent}</div>
        )}
      </div>
    );
  } else {
    bookSelectionUI = (
      <div className={styles.selectedBookCard}>
        <img
          src={selectedBook.coverUrl}
          alt={selectedBook.title}
          className={styles.bookCover}
        />
        <div className={styles.bookInfo}>
          <div className={styles.bookTitle}>{selectedBook.title}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            {selectedBook.author}
          </div>
        </div>
        <button className={styles.removeBookBtn} onClick={handleRemoveBook}>
          ×
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* 방 제목 */}
        <div>
          <label className={styles.label}>
            방 제목<span className={styles.requiredMark}>*</span>
          </label>
          <PixelInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            maxLength={20}
          />
        </div>

        {/* 책 선택 */}
        <div className={styles.bookSelectionContainer}>
          <label className={styles.label}>책 선택 (선택)</label>
          {bookSelectionUI}
        </div>

        {/* 카테고리 */}
        <div className={styles.categoryContainer}>
          <label className={styles.label}>
            카테고리<span className={styles.requiredMark}>*</span>
          </label>
          <select
            className={styles.pixelSelect}
            value={finalCategoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!selectedBook && !!finalCategoryId}
          >
            <option value="" disabled>
              카테고리를 선택하세요
            </option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 최대 인원 */}
        <div>
          <label className={styles.label}>
            최대 인원<span className={styles.requiredMark}>*</span>
          </label>
          <div className={styles.stepperContainer}>
            <PixelButton onClick={() => handleMaxUserBtn(-1)} size="sm">
              -
            </PixelButton>

            <input
              type="number"
              className={styles.stepperInput}
              value={maxUser}
              onChange={handleMaxUserInputChange}
              onBlur={handleMaxUserBlur}
              min={room.currentCount}
              max={20}
            />

            <PixelButton
              onClick={() => handleMaxUserBtn(1)}
              disabled={maxUser >= 20}
              size="sm"
            >
              +
            </PixelButton>
          </div>
          <p className={styles.helpText}>
            현재 인원({room.currentCount}명)보다 적게 설정할 수 없습니다.
          </p>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <PixelButton onClick={closeModal}>취소</PixelButton>
        <PixelButton
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? '수정 중...' : '수정 완료'}
        </PixelButton>
      </div>
    </div>
  );
};
