import { create } from 'zustand';

interface ReadingBook {
  isbn: string;
  title: string;
}

interface ReadingState {
  // 독서 상태
  isReading: boolean;
  isPaused: boolean;
  currentBook: ReadingBook | null;
  elapsedSeconds: number;

  // 액션
  startReading: (book: ReadingBook) => void;
  pauseReading: () => void;
  resumeReading: () => void;
  endReading: () => void;
  tick: () => void;
  updateBook: (book: ReadingBook) => void;
}

export const useReadingStore = create<ReadingState>((set) => ({
  // 초기 상태
  isReading: false,
  isPaused: false,
  currentBook: null,
  elapsedSeconds: 0,

  // 독서 시작
  startReading: (book) =>
    set({
      isReading: true,
      isPaused: false,
      currentBook: book,
      elapsedSeconds: 0,
    }),

  // 일시 정지
  pauseReading: () =>
    set({
      isPaused: true,
    }),

  // 재개
  resumeReading: () =>
    set({
      isPaused: false,
    }),

  // 독서 종료
  endReading: () =>
    set({
      isReading: false,
      isPaused: false,
      currentBook: null,
      elapsedSeconds: 0,
    }),

  // 1초 증가
  tick: () =>
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
    })),

  // 책 변경
  updateBook: (book) =>
    set({
      currentBook: book,
      elapsedSeconds: 0,
    }),
}));
