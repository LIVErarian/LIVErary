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
  | 'error'
  | 'createRoom'
  | 'entrance'
  | null;

interface ModalProps {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  boardId?: string;
  userId?: string; // 타인 프로필 조회용
  friendId?: string; // 친구 요청 수락/거절용
}

interface ErrorState {
  title?: string;
  message: string;
}

// 모달 스택 아이템 인터페이스
interface ModalState {
  currentModal: ModalType;
  modalProps: ModalProps;
  error: ErrorState | null;

  // 타인 프로필 전용 오버레이 상태
  userProfile: { userId: string; friendId?: string } | null;

  openModal: (modal: ModalType, props?: ModalProps) => void;
  closeModal: () => void;
  openError: (error: ErrorState) => void;
  closeError: () => void;

  // 타인 프로필 열기/닫기 (기존 모달 유지)
  openUserProfile: (userId: string, friendId?: string) => void;
  closeUserProfile: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  currentModal: null,
  modalProps: {},
  error: null,
  userProfile: null,

  openModal: (modal, props = {}) =>
    set({ currentModal: modal, modalProps: props }),
  closeModal: () => set({ currentModal: null, modalProps: {} }),
  openError: (error) => set({ error }),
  closeError: () => set({ error: null }),

  openUserProfile: (userId, friendId) =>
    set({ userProfile: { userId, friendId } }),
  closeUserProfile: () => set({ userProfile: null }),
}));
