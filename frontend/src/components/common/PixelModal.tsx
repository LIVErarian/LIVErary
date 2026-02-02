import type { ReactNode } from 'react';

import { BaseModal } from './BaseModal';
import { PixelContainer } from './PixelContainer';

import * as styles from './PixelModal.css';

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
  footer?: ReactNode;
}

export const PixelModal = ({
  isOpen,
  onClose,
  title = '알림',
  children,
  width = '400px',
  footer,
}: PixelModalProps) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div style={{ position: 'relative' }}>
        <PixelContainer variant="board" header={title} style={{ width }}>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
          <div style={{ padding: '16px' }}>{children}</div>
          {footer && <div className={styles.modalFooter}>{footer}</div>}
        </PixelContainer>
      </div>
    </BaseModal>
  );
};
