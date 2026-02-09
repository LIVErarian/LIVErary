import { PixelButton } from './PixelButton';

import * as styles from './PixelPagination.css';

interface PixelPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const PixelPagination = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: PixelPaginationProps) => {
  if (totalPages === 0) return null;

  return (
    <div className={styles.paginationContainer}>
      <PixelButton
        size="sm"
        variant={currentPage === 0 ? 'disabled' : 'beige'}
        onClick={onPrevPage}
        disabled={currentPage === 0}
      >
        ◀ 이전
      </PixelButton>

      <div className={styles.pageInfo}>
        {currentPage + 1} / {totalPages}
      </div>

      <PixelButton
        size="sm"
        variant={currentPage >= totalPages - 1 ? 'disabled' : 'beige'}
        onClick={onNextPage}
        disabled={currentPage >= totalPages - 1}
      >
        다음 ▶
      </PixelButton>
    </div>
  );
};
