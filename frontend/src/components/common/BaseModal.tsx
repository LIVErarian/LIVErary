import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useModalEffect } from '@/hooks/common/useModalEffect';

import * as styles from './BaseModal.css';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  zIndex?: number;
}

let modalZIndexCounter = 1000;

export const BaseModal = ({
  isOpen,
  onClose,
  children,
  zIndex,
}: BaseModalProps) => {
  useModalEffect(isOpen, onClose);

  const myZRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // z-value 지정하지 않으면 임의로 할당
    if (myZRef.current === null) {
      myZRef.current =
        typeof zIndex === 'number' ? zIndex : ++modalZIndexCounter;
    }
  }, [isOpen, zIndex]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = myZRef.current
    ? { zIndex: myZRef.current }
    : {};
  const contentStyle: React.CSSProperties = myZRef.current
    ? { zIndex: myZRef.current + 1 }
    : {};

  return createPortal(
    <div className={styles.overlay} style={overlayStyle} onClick={onClose}>
      {/* 이벤트 전파 중단 */}
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
