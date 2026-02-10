import { useQuote } from '@/services/queries/useQuote';
import { ModalFooter } from '../common/ModalFooter';
import { PixelButton } from '../common/PixelButton';
import { PixelModal } from '../common/PixelModal';

import * as styles from './QuoteModal.css';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
}

export const QuoteModal = ({ isOpen, onClose, zIndex }: QuoteModalProps) => {
  const { data: quote, isLoading, isError, refetch } = useQuote();

  let content;

  if (isLoading) {
    content = (
      <div className={styles.loading}>책장에서 문장을 꺼내는 중... 📚</div>
    );
  } else if (isError || !quote) {
    content = <div className={styles.error}>문장을 불러오지 못했습니다.</div>;
  } else {
    content = (
      <>
        <p className={styles.content}>"{quote.content}"</p>
        <div className={styles.metaInfo}>
          <span className={styles.bookTitle}>『{quote.title}』</span>
          <span>
            {quote.author} · {quote.publisher}
          </span>
        </div>
      </>
    );
  }

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title="오늘의 문장"
      width="400px"
      zIndex={zIndex}
      footer={
        <ModalFooter>
          <PixelButton size="sm" variant="primary" onClick={() => refetch()}>
            다른 문장 보기
          </PixelButton>
        </ModalFooter>
      }
    >
      <div className={styles.container}>{content}</div>
    </PixelModal>
  );
};
