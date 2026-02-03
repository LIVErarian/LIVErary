import { useEffect } from 'react';

/**
 * ESC를 눌러 모달을 닫고 모달 뒤 스크롤을 방지합니다.
 * @param isOpen
 * @param onClose
 */
export const useModalEffect = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!isOpen) return;

    const moveKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'w',
      'W',
      'a',
      'A',
      's',
      'S',
      'd',
      'D',
      ' ',
      'Space',
      'Spacebar',
    ]);

    // ESC 키 핸들러
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const blockMoveKeys = (e: KeyboardEvent) => {
      if (moveKeys.has(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const resetMoveKeys = () => {
      moveKeys.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key }));
      });
    };

    window.addEventListener('keydown', handleEsc);
    window.addEventListener('keydown', blockMoveKeys, true);
    window.addEventListener('keyup', blockMoveKeys, true);
    resetMoveKeys();
    // 모달 뒤 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keydown', blockMoveKeys, true);
      window.removeEventListener('keyup', blockMoveKeys, true);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
};
