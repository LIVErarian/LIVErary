import { useLogout } from '@/hooks/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';
import { BoardCreate } from '../board/BoardCreate';
import { BoardDetail } from '../board/BoardDetail';
import { BoardList } from '../board/BoardList';
import { BoardUpdate } from '../board/BoardUpdate';
import { PixelModal } from '../common/PixelModal';
import { BookshelfModal } from './BookshelfModal';
import { ConfirmModal } from './ConfirmModal';
import { ElevatorModal } from './ElevatorModal';
import { ErrorModal } from './ErrorModal';
import { FriendSearchModal } from './FriendSearchModal';
import { ProfileModal } from './ProfileModal';

import * as styles from './GlobalModal.css';

// const BoardContent = () => (
//   <div className={styles.contentWrapper}>
//     <p>게시판 기능을 준비 중입니다.</p>
//   </div>
// );

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
          closeModal();
        }}
        onConfirm={() => {
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
      {/* 게시글 목록 모달 */}
      <PixelModal
        isOpen={currentModal === 'boardList'}
        onClose={closeModal}
        title="게시판"
        width="800px"
      >
        <BoardList />
      </PixelModal>

      {/* 게시글 작성 모달 */}
      <PixelModal
        isOpen={currentModal === 'boardCreate'}
        onClose={closeModal} // 작성 중 닫으면 데이터 날아감 (필요시 ConfirmModal 추가 가능)
        title="게시글 작성"
        width="800px"
      >
        <BoardCreate />
      </PixelModal>

      {/* 게시글 상세 모달 */}
      <PixelModal
        isOpen={currentModal === 'boardDetail'}
        onClose={closeModal}
        title="게시글"
        width="800px"
      >
        {/* modalProps에서 boardId를 꺼내서 전달 */}
        {modalProps.boardId && <BoardDetail boardId={modalProps.boardId} />}
      </PixelModal>

      {/* 게시글 수정 모달 */}
      <PixelModal
        isOpen={currentModal === 'boardUpdate'}
        onClose={closeModal}
        title="게시글 수정"
        width="800px"
      >
        {/* modalProps에서 boardId를 꺼내서 전달 */}
        {modalProps.boardId && <BoardUpdate boardId={modalProps.boardId} />}
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

      {/* 나의 서재 모달 */}
      <BookshelfModal
        isOpen={currentModal === 'bookshelf'}
        onClose={closeModal}
      />

      {/* 친구 검색 모달 */}
      {currentModal === 'friendSearch' && <FriendSearchModal />}
    </>
  );
};
