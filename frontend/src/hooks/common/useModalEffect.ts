import { useEffect } from 'react';

/**
 * ESC를 눌러 모달을 닫고 모달 뒤 스크롤을 방지합니다.
 * @param isOpen
 * @param onClose
 */
export const useModalEffect = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!isOpen) return;

    // ESC 키 핸들러
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    // 모달 뒤 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
};
