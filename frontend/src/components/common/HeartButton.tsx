/**
 * HeartButton 컴포넌트
 *
 * 찜하기/찜 취소를 위한 픽셀 하트 버튼
 * - 찜 상태에 따라 빨간색/회색으로 표시
 * - 클릭 시 토글 가능
 */

import * as styles from './HeartButton.css';

interface HeartButtonProps {
  isWished: boolean;
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}

export const HeartButton = ({
  isWished,
  onClick,
  disabled = false,
  title,
  className,
}: HeartButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    onClick(e);
  };

  return (
    <button
      className={`${styles.heartButton} ${className || ''}`}
      onClick={handleClick}
      title={title || (isWished ? '찜 취소' : '찜하기')}
      type="button"
      disabled={disabled}
    >
      {/* 픽셀 아트 하트 - 찜 상태에 따라 빨간색/회색 */}
      <div className={isWished ? styles.pixelHeart : styles.pixelHeartGray} />
    </button>
  );
};
