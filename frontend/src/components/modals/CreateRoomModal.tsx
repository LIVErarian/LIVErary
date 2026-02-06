import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import { useCreateRoomForm } from '@/hooks/useCreateRoomForm';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './CreateRoomModal.css';

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return [`${h}:00`, `${h}:30`];
}).flat();

export const CreateRoomModal = () => {
  const { closeModal } = useModalStore();

  const { formState, setters, handlers, searchContainerRef, isPending } =
    useCreateRoomForm(closeModal);

  const {
    title,
    accessType,
    maxUser,
    categoryId,
    isScheduled,
    startDate,
    startTime,
    endDate,
    endTime,
    selectedBook,
    categories,
    bookSearchKeyword,
    bookSearchResults,
    isSearchingBooks,
    debouncedKeyword,
  } = formState;

  // 버튼 텍스트
  let submitButtonText = '방 만들기';
  if (isPending) submitButtonText = '생성 중...';
  else if (isScheduled) submitButtonText = '예약하기';

  // 검색 드롭다운 내용
  let dropdownContent = null;
  if (debouncedKeyword && debouncedKeyword.length >= 2) {
    if (isSearchingBooks) {
      dropdownContent = (
        <div className={styles.dropdownMessage}>검색 중...</div>
      );
    } else if (bookSearchResults.length > 0) {
      dropdownContent = (
        <>
          {bookSearchResults.map((book) => (
            <div
              key={book.isbn}
              className={styles.searchResultItem}
              onClick={() => handlers.handleBookSelect(book)}
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

  // 책 선택 UI
  let bookSelectionUI;
  if (!selectedBook) {
    bookSelectionUI = (
      <div className={styles.bookSelectContainer} ref={searchContainerRef}>
        <PixelInput
          placeholder="책 제목이나 저자를 입력하세요"
          value={bookSearchKeyword}
          onChange={handlers.handleBookSearchChange}
          fullWidth
        />
        {/* 드롭다운 (내용이 있을 때만 렌더링) */}
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
            {bookSearchKeyword || selectedBook.author}
          </div>
        </div>
        <button
          className={styles.removeBookBtn}
          onClick={handlers.handleRemoveBook}
        >
          ×
        </button>
      </div>
    );
  }

  // 예약 설정 UI
  const scheduledUI = isScheduled && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <span className={styles.helpText}>시작 시간</span>
        <div className={styles.dateTimeRow}>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setters.setStartDate(e.target.value)}
          />
          <select
            className={styles.timeSelect}
            value={startTime}
            onChange={(e) => setters.setStartTime(e.target.value)}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={`start-${t}`} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className={styles.helpText}>종료 시간</span>
        <div className={styles.dateTimeRow}>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            min={startDate || new Date().toISOString().split('T')[0]}
            onChange={(e) => setters.setEndDate(e.target.value)}
          />
          <select
            className={styles.timeSelect}
            value={endTime}
            onChange={(e) => setters.setEndTime(e.target.value)}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={`end-${t}`} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* 스크롤 가능한 본문 */}
      <div className={styles.scrollContent}>
        {/* 방 제목 */}
        <div>
          <label className={styles.label}>
            방 제목<span className={styles.requiredMark}>*</span>
          </label>
          <PixelInput
            placeholder="방 제목을 입력하세요 (최대 20자)"
            value={title}
            onChange={(e) => setters.setTitle(e.target.value)}
            fullWidth
            maxLength={20}
          />
        </div>

        {/* 책 선택 */}
        <div style={{ position: 'relative', zIndex: 20 }}>
          <label className={styles.label}>책 선택 (선택)</label>
          {bookSelectionUI}
        </div>

        {/* 카테고리 */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <label className={styles.label}>
            카테고리<span className={styles.requiredMark}>*</span>
          </label>
          <select
            className={styles.pixelSelect}
            value={categoryId}
            onChange={(e) => setters.setCategoryId(e.target.value)}
            disabled={!!selectedBook && !!categoryId}
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

        {/* 공개 설정 + 최대 인원 (가로 배치) */}
        <div className={styles.rowGroup}>
          {/* 공개 설정 */}
          <div>
            <label className={styles.label}>
              공개 설정<span className={styles.requiredMark}>*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="accessType"
                  className={styles.checkbox}
                  checked={accessType === 'PUBLIC'}
                  onChange={() => setters.setAccessType('PUBLIC')}
                  disabled={isScheduled}
                />
                공개
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="accessType"
                  className={styles.checkbox}
                  checked={accessType === 'PRIVATE'}
                  onChange={() => setters.setAccessType('PRIVATE')}
                />
                비공개
              </label>
            </div>
          </div>

          {/* 최대 인원 */}
          <div>
            <label className={styles.label}>
              최대 인원<span className={styles.requiredMark}>*</span>
            </label>
            <div className={styles.stepperContainer}>
              <PixelButton
                onClick={() => handlers.handleMaxUserBtn(-1)}
                disabled={maxUser <= 2}
                size="sm"
              >
                -
              </PixelButton>

              {/* 숫자 입력 인풋 */}
              <input
                type="number"
                className={styles.stepperInput}
                value={maxUser}
                onChange={handlers.handleMaxUserInputChange}
                onBlur={handlers.handleMaxUserBlur}
                min={2}
                max={20}
              />

              <PixelButton
                onClick={() => handlers.handleMaxUserBtn(1)}
                disabled={maxUser >= 20}
                size="sm"
              >
                +
              </PixelButton>
            </div>
          </div>
        </div>

        {/* 예약 설정 */}
        <div>
          <div className={styles.radioGroup} style={{ marginBottom: '12px' }}>
            <label className={styles.radioLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={isScheduled}
                onChange={handlers.handleScheduledChange}
              />
              <span style={{ fontWeight: 'bold' }}>예약 방 만들기</span>
            </label>
          </div>
          {scheduledUI}
        </div>
      </div>

      {/* 버튼 그룹 (고정) */}
      <div className={styles.buttonGroup}>
        <PixelButton onClick={closeModal}>취소</PixelButton>
        <PixelButton
          variant="primary"
          onClick={handlers.handleSubmit}
          disabled={isPending}
        >
          {submitButtonText}
        </PixelButton>
      </div>
    </div>
  );
};
