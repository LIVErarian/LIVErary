import { create } from 'zustand';

export type ModalType =
  | 'settings'
  | 'profile'
  | 'elevator'
  | 'board_list'
  | 'board_detail'
  | 'board_create'
  | 'board_update'
  | 'logout'
  | 'roomlist'
  | 'move'
  | 'rank'
  | 'error'
  | null;

interface ModalProps {
  title?: string;
  message?: string;
  onConfirm?: () => void;
}

interface ModalState {
  currentModal: ModalType;
  modalProps: ModalProps;
  openModal: (modal: ModalType, props?: ModalProps) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  currentModal: null,
  modalProps: {}, // 초기값 비움
  openModal: (modal, props = {}) =>
    set({ currentModal: modal, modalProps: props }),
  closeModal: () => set({ currentModal: null, modalProps: {} }),
}));
