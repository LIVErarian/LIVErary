// src/components/common/PixelModal.tsx
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useModalEffect } from '@/hooks/common/useModalEffect';
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
  // ESC로 닫기
  useModalEffect(isOpen, onClose);

  if (!isOpen) return null;

  // doclument.body에 포탈로 모달 렌더링
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      {/* 내부 클릭 시 닫히지 않도록 이벤트 전파 중단(stopPropagation) */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <PixelContainer variant="board" header={title} style={{ width }}>
          {/* 우측 상단 닫기 버튼 */}
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>

          {/* 모달 내용 */}
          <div style={{ padding: '16px' }}>{children}</div>

          {/* 모달 푸터 */}
          {footer && <div className={styles.modalFooter}>{footer}</div>}
        </PixelContainer>
      </div>
    </div>,
    document.body,
  );
};
