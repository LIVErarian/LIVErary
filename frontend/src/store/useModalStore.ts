import { create } from 'zustand';

export type ModalType =
  | 'settings'
  | 'profile'
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
  | 'friendList'
  // 최초 로그인 온보딩 모달
  | 'preferences'
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
