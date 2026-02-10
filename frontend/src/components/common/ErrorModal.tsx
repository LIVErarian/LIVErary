import { ModalFooter } from './ModalFooter';
import { PixelButton } from './PixelButton';
import { PixelModal } from './PixelModal';

import { theme } from '@/styles/theme.css';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  isError?: boolean;
  zIndex?: number;
}

export const ErrorModal = ({
  isOpen,
  onClose,
  title = '오류 발생', // 기본 타이틀
  message,
  isError = false,
  zIndex,
}: ErrorModalProps) => {
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="360px"
      zIndex={zIndex}
      footer={
        <ModalFooter variant="center">
          <PixelButton
            size="sm"
            variant={isError ? 'danger' : 'primary'}
            onClick={onClose}
          >
            확인
          </PixelButton>
        </ModalFooter>
      }
    >
      <div
        style={{
          textAlign: 'center',
          padding: '20px 10px',
          lineHeight: '1.5',
          wordBreak: 'keep-all',
          color: theme.colors.black,
        }}
      >
        {message}
      </div>
    </PixelModal>
  );
};
