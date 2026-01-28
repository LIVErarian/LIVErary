import { useNavigate } from 'react-router-dom';

import { useModalStore } from '@/store/useModalStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { PixelButton } from '../common/PixelButton';
import { PixelModal } from '../common/PixelModal';
import { ElevatorModal } from './ElevatorModal';

import * as styles from './GlobalModal.css';

const BoardContent = () => (
  <div className={styles.contentWrapper}>
    <p>게시판 기능을 준비 중입니다.</p>
  </div>
);

const RoomContent = () => (
  <div className={styles.contentWrapper}>
    <p>방 목록 기능을 준비중입니다.</p>
  </div>
);

const RankContent = () => (
  <div className={styles.contentWrapper}>
    <p>랭킹 기능을 준비중입니다.</p>
  </div>
);

const ErrorContent = ({
  message,
  onClose,
}: {
  message?: string;
  onClose: () => void;
}) => (
  <div className={styles.contentWrapper}>
    <div className={styles.errorMessage}>
      {message || '오류가 발생했습니다.'}
    </div>
    <div className={styles.buttonWrapper}>
      <PixelButton onClick={onClose}>확인</PixelButton>
    </div>
  </div>
);

export const GlobalModal = () => {
  const { currentModal, modalProps, closeModal } = useModalStore();

  const navigate = useNavigate();

  if (!currentModal) return null;

  const handleLogout = () => {
    //TODO: 실제 API 호출
    alert('로그아웃 되었습니다');
    closeModal();
    navigate('/login');
  };

  return (
    <>
      {/* 내 방 / 로비 이동 모달 */}
      <ConfirmModal
        isOpen={currentModal === 'move'}
        onClose={closeModal}
        onConfirm={() => {
          modalProps.onConfirm?.();
          closeModal();
        }}
        title={modalProps.title || '알림'}
        isDanger={false}
        confirmText="이동하기"
      >
        <p>{modalProps.message}</p>
      </ConfirmModal>

      {/* 엘리베이터 모달 */}
      {currentModal === 'elevator' && <ElevatorModal />}

      {/* 게시판 모달 */}
      <PixelModal
        isOpen={currentModal === 'board'}
        onClose={closeModal}
        title="📋 게시판"
        width="500px"
      >
        <BoardContent />
      </PixelModal>

      {/* 방 목록 모달 */}
      <PixelModal
        isOpen={currentModal === 'roomlist'}
        onClose={closeModal}
        title="🚪 방 목록"
        width="500px"
      >
        <RoomContent />
      </PixelModal>

      {/* 랭킹 모달 */}
      <PixelModal
        isOpen={currentModal === 'rank'}
        onClose={closeModal}
        title="랭킹"
        width="500px"
      >
        <RankContent />
      </PixelModal>

      {/* 로그아웃 모달 */}
      <ConfirmModal
        isOpen={currentModal === 'logout'}
        onClose={closeModal}
        onConfirm={handleLogout}
        title="로그아웃"
        isDanger={true}
        confirmText="로그아웃"
      >
        <p>정말 로그아웃 하시겠습니까?</p>
      </ConfirmModal>

      {/* 에러 알림 모달 */}
      <PixelModal
        isOpen={currentModal === 'error'}
        onClose={closeModal}
        title={modalProps.title || '알림'}
        width="400px"
      >
        <ErrorContent message={modalProps.message} onClose={closeModal} />
      </PixelModal>
    </>
  );
};
