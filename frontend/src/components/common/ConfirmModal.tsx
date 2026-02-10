import type { ReactNode } from 'react';

import { ModalFooter } from './ModalFooter';
import { PixelButton } from './PixelButton';
import { PixelModal } from './PixelModal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  zIndex?: number;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '알림',
  children,
  confirmText = '확인',
  cancelText = '취소',
  isDanger = false,
  zIndex,
}: ConfirmModalProps) => {
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="320px"
      zIndex={zIndex}
      footer={
        <ModalFooter variant="center">
          {/* 취소 버튼 */}
          <PixelButton size="sm" variant="beige" onClick={onClose}>
            {cancelText}
          </PixelButton>

          {/* 확인 버튼 */}
          <PixelButton
            size="sm"
            onClick={onConfirm}
            variant={isDanger ? 'danger' : 'primary'}
          >
            {confirmText}
          </PixelButton>
        </ModalFooter>
      }
    >
      {/* 본문 내용 */}
      <div style={{ textAlign: 'center', padding: '10px 0' }}>{children}</div>
    </PixelModal>
  );
};
