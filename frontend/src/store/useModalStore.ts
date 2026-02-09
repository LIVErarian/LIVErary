import { create } from 'zustand';

export type ModalType =
  | 'settings'
  | 'profile'
  | 'userProfile' // 타인 프로필 조회
  | 'elevator'
  | 'boardList'
  | 'boardDetail'
  | 'boardCreate'
  | 'boardUpdate'
  | 'logout'
  | 'roomList'
  | 'move'
  | 'rank'
  | 'error'
  | 'bookshelf'
  | 'bookSearch'
  | 'friendList'
  // 최초 로그인 온보딩 모달
  | 'preferences'
  | 'error'
  | 'createRoom'
  | 'entrance'
  | 'bookDetail'
  | 'notification'
  | 'passwordReset'
  | 'quote'
  | 'bookSelection'
  | 'readingCompletion'
  | 'alert' // 알림 (ErrorModal 재사용)
  | 'confirm' // 확인
  | 'attendance' // 출석 체크
  | 'concentration'
  | 'fullScreenImage'
  | null;

interface ModalProps {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  boardId?: string;
  userId?: string; // 타인 프로필 조회용
  friendId?: string; // 친구 요청 수락/거절용
  isbn?: string;
  from?: ModalType; // 모달이 어디서 열렸는지
  initialTab?: 'FRIENDS' | 'REQUESTS' | 'BLOCKED';
  preferences?: string[]; // 선호 카테고리 수정용
  initialBoardTab?: 'INQUIRY' | 'PROMOTION' | 'NOTICE';
  initialIsWished?: boolean;
  isChanging?: boolean; // 책 변경 여부 (독서 타이머용)
  isDanger?: boolean; // 위험 작업 여부
  src?: string;
  alt?: string;
  isVideo?: boolean;
}

interface ErrorState {
  title?: string;
  message: string;
}

// 모달 스택 아이템 인터페이스
interface ModalItem {
  type: ModalType;
  props: ModalProps;
}

interface ModalState {
  currentModal: ModalType;
  modalProps: ModalProps;

  modalStack: ModalItem[];

  error: ErrorState | null;

  userProfile: { userId: string; friendId?: string } | null;

  openModal: (modal: ModalType, props?: ModalProps) => void;
  closeModal: () => void;
  openError: (error: ErrorState) => void;
  closeError: () => void;

  openUserProfile: (userId: string, friendId?: string) => void;
  closeUserProfile: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  currentModal: null,
  modalProps: {},
  modalStack: [],
  error: null,
  userProfile: null,

  openModal: (modal, props = {}) =>
    set((state) => {
      const newStack = [...state.modalStack, { type: modal, props }];
      return {
        modalStack: newStack,
        currentModal: modal,
        modalProps: props,
      };
    }),

  closeModal: () =>
    set((state) => {
      const newStack = state.modalStack.slice(0, -1);
      const topModal = newStack[newStack.length - 1];
      return {
        modalStack: newStack,
        currentModal: topModal ? topModal.type : null,
        modalProps: topModal ? topModal.props : {},
      };
    }),

  openError: (error) => set({ error }),
  closeError: () => set({ error: null }),

  openUserProfile: (userId, friendId) =>
    set({ userProfile: { userId, friendId } }),
  closeUserProfile: () => set({ userProfile: null }),
}));
