import { useLogout } from '@/hooks/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';
import { BoardCreate } from '../board/BoardCreate';
import { BoardDetail } from '../board/BoardDetail';
import { BoardList } from '../board/BoardList';
import { BoardUpdate } from '../board/BoardUpdate';
import { PixelButton } from '../common/PixelButton';
import { PixelModal } from '../common/PixelModal';
import { BookSearchModal } from './BookSearchModal';
import { BookshelfModal } from './BookshelfModal';
import { ConfirmModal } from './ConfirmModal';
import { CreateRoomModal } from './CreateRoomModal';
import { ElevatorModal } from './ElevatorModal';
import { ErrorModal } from './ErrorModal';
import { FriendListModal } from './FriendListModal';
import { ProfileModal } from './ProfileModal';

import * as styles from './GlobalModal.css';

// const BoardContent = () => (
//   <div className={styles.contentWrapper}>
//     <p>게시판 기능을 준비 중입니다.</p>
//   </div>
// );

const RoomContent = () => {
  const { openModal } = useModalStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
      }}
    >
      {/* 🟢 상단 헤더 영역 (제목 + 방 만들기 버튼) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>방 목록</h2>

        {/* 방 만들기 버튼 */}
        <PixelButton
          variant="primary" // 강조 색상 (빨강/브랜드 컬러)
          onClick={() => openModal('createRoom')} // 'createRoom' 모달 열기
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          + 방 만들기
        </PixelButton>
      </div>
    </div>
  );
};

const RankContent = () => (
  <div className={styles.contentWrapper}>
    <p>랭킹 기능을 준비중입니다.</p>
  </div>
);

export const GlobalModal = () => {
  const {
    currentModal,
    modalProps,
    closeModal,
    userProfile,
    closeUserProfile,
  } = useModalStore();
  const { mutate: logout } = useLogout();

  if (!currentModal && !userProfile) return null;

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
          if (modalProps.onCancel) modalProps.onCancel();
          closeModal();
        }}
        onConfirm={() => {
          if (modalProps.onConfirm) modalProps.onConfirm();
          closeModal();
        }}
        title={modalProps.title || '알림'}
        isDanger={false}
        confirmText="이동하기"
      >
        <p>{modalProps.message}</p>
      </ConfirmModal>

      {/* 방 입퇴장 확인 모달 */}
      <ConfirmModal
        isOpen={currentModal === 'entrance'}
        onClose={() => {
          if (modalProps.onCancel) modalProps.onCancel();
          closeModal();
        }}
        onConfirm={() => {
          if (modalProps.onConfirm) modalProps.onConfirm();
          closeModal();
        }}
        title={modalProps.title || '입장 확인'}
      >
        <p style={{ textAlign: 'center' }}>
          {modalProps.message || '이 방에 입장하시겠습니까?'}
        </p>
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
        isOpen={currentModal === 'roomList'}
        onClose={closeModal}
        title="🚪 방 목록"
        width="500px"
      >
        <RoomContent />
      </PixelModal>

      {/* 방 만들기 모달 */}
      <PixelModal
        isOpen={currentModal === 'createRoom'}
        onClose={closeModal}
        title="방 추가하기"
        width="500px"
      >
        <CreateRoomModal />
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

      {/* 타인 프로필 모달 */}
      <ProfileModal
        isOpen={currentModal === 'userProfile'}
        onClose={closeModal}
        userId={modalProps.userId}
        friendId={modalProps.friendId}
      />

      {/* 친구 목록 모달 */}
      <PixelModal
        isOpen={currentModal === 'friendList'}
        onClose={closeModal}
        title="친구 목록"
        width="500px"
      >
        <FriendListModal />
      </PixelModal>

      {/* 나의 서재 모달 */}
      <PixelModal
        isOpen={currentModal === 'bookshelf'}
        onClose={closeModal}
        title="나의 서재"
        width="800px"
      >
        <BookshelfModal />
      </PixelModal>

      {/* 책 검색 모달 */}
      <PixelModal
        isOpen={currentModal === 'bookSearch'}
        onClose={closeModal}
        title="책 검색"
        width="800px"
      >
        <BookSearchModal />
      </PixelModal>

      {/* 오버레이: 타인 프로필 모달 (항상 최상단) */}
      {userProfile && (
        <ProfileModal
          isOpen={true}
          onClose={closeUserProfile}
          userId={userProfile.userId}
          friendId={userProfile.friendId}
        />
      )}
    </>
  );
};
