import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useModalEffect } from '@/hooks/common/useModalEffect';

import * as styles from './BaseModal.css';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const BaseModal = ({ isOpen, onClose, children }: BaseModalProps) => {
  useModalEffect(isOpen, onClose);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      {/* 이벤트 전파 중단 */}
      <div
        className={styles.contentWrapper}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
