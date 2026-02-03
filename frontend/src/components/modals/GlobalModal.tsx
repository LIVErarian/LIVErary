import { useLogout } from '@/hooks/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';
import { PixelModal } from '../common/PixelModal';
import { ConfirmModal } from './ConfirmModal';
import { ElevatorModal } from './ElevatorModal';
import { ErrorModal } from './ErrorModal';
import { FriendSearchModal } from './FriendSearchModal';
import { ProfileModal } from './ProfileModal';

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

export const GlobalModal = () => {
  const { currentModal, modalProps, closeModal } = useModalStore();
  const { mutate: logout } = useLogout();

  if (!currentModal) return null;

  const handleLogout = () => {
    closeModal();
    logout();
  };

  return (
    <>
      {/* 내 방 / 로비 이동 모달 */}
      <ConfirmModal
        isOpen={currentModal === 'move'}
        onClose={() => {
          modalProps.onCancel?.();
          closeModal();
        }}
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
      {/* TODO: board_list, board_detail, board_create, board_update로 세분화 */}
      <PixelModal
        isOpen={currentModal === 'board_list'}
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
      <ErrorModal
        isOpen={currentModal === 'error'}
        onClose={closeModal}
        title={modalProps.title || '알림'}
        message={modalProps.message || '알 수 없는 오류가 발생했습니다.'}
      />

      {/* 프로필 모달 */}
      <ProfileModal isOpen={currentModal === 'profile'} onClose={closeModal} />

      {/* 친구 검색 모달 */}
      {currentModal === 'friendSearch' && <FriendSearchModal />}
    </>
  );
};
