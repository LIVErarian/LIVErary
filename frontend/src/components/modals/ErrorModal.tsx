import { ModalFooter } from '../common/ModalFooter';
import { PixelButton } from '../common/PixelButton';
import { PixelModal } from '../common/PixelModal';

import { theme } from '@/styles/theme.css';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export const ErrorModal = ({
  isOpen,
  onClose,
  title = '오류 발생', // 기본 타이틀
  message,
}: ErrorModalProps) => {
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="360px"
      footer={
        <ModalFooter variant="center">
          <PixelButton size="sm" variant="danger" onClick={onClose}>
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
