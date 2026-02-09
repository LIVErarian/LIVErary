import { useEffect, useRef, useState } from 'react';

import { useModalStore } from '@/store/useModalStore';

import * as styles from './FullScreenImageModal.css';

interface FullScreenImageModalProps {
  src: string;
  alt?: string;
  isVideo?: boolean;
}

export const FullScreenImageModal = ({
  src,
  alt = 'Focus Mode',
  isVideo = false,
}: FullScreenImageModalProps) => {
  const { closeModal } = useModalStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  // 비디오 자동 재생 로직
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(
              '[FullScreenModal] Video started playing successfully.',
            );
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log(
                '[FullScreenModal] Play request was interrupted (Harmless).',
              );
            } else {
              console.error('[FullScreenModal] Autoplay failed:', error);
            }
          });
      }
    }
  }, [src, isVideo]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  return (
    <div className={styles.container} onClick={closeModal}>
      {/* 닫기 버튼 */}
      <button className={styles.closeButton} onClick={closeModal}>
        ✕
      </button>

      {/* 미디어 콘텐츠 */}
      <div className={styles.mediaWrapper} onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video
            ref={videoRef}
            src={src}
            className={styles.mediaElement}
            muted // 자동 재생 필수
            loop // 반복 재생
            autoPlay // 이중 안전장치
            playsInline
            onError={(e) => {
              console.error('[FullScreenModal] Video Error Event:', e);
              setHasError(true);
            }}
            style={{ display: hasError ? 'none' : 'block' }}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            className={styles.mediaElement}
            onError={() => {
              console.error('[FullScreenModal] Image failed to load');
              setHasError(true);
            }}
            style={{ display: hasError ? 'none' : 'block' }}
          />
        )}

        {/* 에러 메시지 */}
        {hasError && (
          <div className={styles.errorContainer}>
            <h2>Media Failed to Load</h2>
            <p>Check console for details.</p>
          </div>
        )}
      </div>
    </div>
  );
};
