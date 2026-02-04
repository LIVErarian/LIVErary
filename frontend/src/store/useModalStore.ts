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
}

interface ErrorState {
  title?: string;
  message: string;
}

interface ModalState {
  currentModal: ModalType;
  modalProps: ModalProps;
  error: ErrorState | null; // 에러 상태 분리

  openModal: (modal: ModalType, props?: ModalProps) => void;
  closeModal: () => void;
  openError: (error: ErrorState) => void;
  closeError: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  currentModal: null,
  modalProps: {},
  error: null,

  openModal: (modal, props = {}) =>
    set({ currentModal: modal, modalProps: props }),
  closeModal: () => set({ currentModal: null, modalProps: {} }),
  openError: (error) => set({ error }),
  closeError: () => set({ error: null }),
}));
