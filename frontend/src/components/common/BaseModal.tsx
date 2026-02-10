import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useModalEffect } from '@/hooks/common/useModalEffect';

import * as styles from './BaseModal.css';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  zIndex?: number;
}

export const BaseModal = ({
  isOpen,
  onClose,
  children,
  zIndex = 1000, // 기본값
}: BaseModalProps) => {
  useModalEffect(isOpen, onClose);

  if (!isOpen) return null;

  const overlayStyle = { zIndex };
  const contentStyle = { zIndex: zIndex + 1 };

  return createPortal(
    <div className={styles.overlay} style={overlayStyle} onClick={onClose}>
      <div
        className={styles.contentWrapper}
        style={contentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
