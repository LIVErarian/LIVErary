import { useLogout } from '@/hooks/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';
import { BoardCreate } from '../board/BoardCreate';
import { BoardDetail } from '../board/BoardDetail';
import { BoardList } from '../board/BoardList';
import { BoardUpdate } from '../board/BoardUpdate';
import { PixelModal } from '../common/PixelModal';
import { AttendanceModal } from './AttendanceModal';
import { BookDetailModal } from './BookDetailModal';
import { BookSearchModal } from './BookSearchModal';
import { BookSelectionModal } from './BookSelectionModal';
import { BookshelfModal } from './BookshelfModal';
import { ConfirmModal } from './ConfirmModal';
import { CreateRoomModal } from './CreateRoomModal';
import { ElevatorModal } from './ElevatorModal';
import { ErrorModal } from './ErrorModal';
import { FriendListModal } from './FriendListModal';
import { NotificationModal } from './NotificationModal';
import { PasswordResetModal } from './PasswordResetModal';
import { PreferencesModal } from './PreferencesModal';
import { ProfileModal } from './ProfileModal';
import { QuoteModal } from './QuoteModal';
import { RankingModal } from './RankingModal';
import { ReadingCompletionModal } from './ReadingCompletionModal';
import { RoomListModal } from './RoomListModal';

export const GlobalModal = () => {
  const { modalStack, closeModal, userProfile, closeUserProfile, openModal } =
    useModalStore();
  const { mutate: logout } = useLogout();

  if (modalStack.length === 0 && !userProfile) return null;

  const handleLogout = () => {
    closeModal();
    logout();
  };

  return (
    <>
      {modalStack.map((modalItem, index) => {
        const { type: currentModal, props: modalProps } = modalItem;
        const key = `${currentModal}-${index}`; // Simple key assuming order doesn't shuffle

        return (
          <div key={key} style={{ zIndex: 1000 + index, position: 'relative' }}>
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
            <PixelModal
              isOpen={currentModal === 'boardList'}
              onClose={closeModal}
              title="게시판"
              width="800px"
            >
              <BoardList />
            </PixelModal>

            <PixelModal
              isOpen={currentModal === 'boardCreate'}
              onClose={closeModal}
              title="게시글 작성"
              width="800px"
            >
              <BoardCreate />
            </PixelModal>

            <PixelModal
              isOpen={currentModal === 'boardDetail'}
              onClose={closeModal}
              title="게시글"
              width="800px"
            >
              {modalProps.boardId && (
                <BoardDetail boardId={modalProps.boardId} />
              )}
            </PixelModal>

            <PixelModal
              isOpen={currentModal === 'boardUpdate'}
              onClose={closeModal}
              title="게시글 수정"
              width="800px"
            >
              {modalProps.boardId && (
                <BoardUpdate boardId={modalProps.boardId} />
              )}
            </PixelModal>

            {/* 방 목록 모달 */}
            <PixelModal
              isOpen={currentModal === 'roomList'}
              onClose={closeModal}
              title="방 목록"
              width="auto"
            >
              <RoomListModal />
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
              title="🏆 랭킹"
              width="550px"
            >
              <RankingModal />
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

            <ErrorModal
              isOpen={currentModal === 'error' || currentModal === 'alert'}
              onClose={closeModal}
              title={modalProps.title || '알림'}
              message={modalProps.message || '알 수 없는 오류가 발생했습니다.'}
              isError={currentModal === 'error'}
            />

            {/* 일반 확인(Confirm) 모달 */}
            <ConfirmModal
              isOpen={currentModal === 'confirm'}
              onClose={() => {
                if (modalProps.onCancel) modalProps.onCancel();
                closeModal();
              }}
              onConfirm={() => {
                if (modalProps.onConfirm) modalProps.onConfirm();
                closeModal();
              }}
              title={modalProps.title || '확인'}
              confirmText={modalProps.title === '삭제' ? '삭제' : '확인'}
              isDanger={
                modalProps.title === '삭제' || modalProps.title === '탈퇴'
              }
            >
              <p style={{ textAlign: 'center' }}>{modalProps.message}</p>
            </ConfirmModal>

            {/* 프로필 모달 */}
            <ProfileModal
              isOpen={currentModal === 'profile'}
              onClose={closeModal}
            />

            {/* 타인 프로필 모달 (일반 모달로 띄울 때) */}
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

            {currentModal === 'preferences' && (
              <PreferencesModal
                preferences={modalProps.preferences}
                from={modalProps.from}
              />
            )}

            {/* 나의 서재 모달 */}
            <PixelModal
              isOpen={
                currentModal === 'bookshelf' ||
                (currentModal === 'bookDetail' &&
                  modalProps.from === 'bookshelf')
              }
              onClose={closeModal}
              title="나의 서재"
              width="800px"
            >
              <BookshelfModal />
            </PixelModal>

            {/* 책 검색 모달 */}
            <PixelModal
              isOpen={
                currentModal === 'bookSearch' ||
                (currentModal === 'bookDetail' &&
                  modalProps.from === 'bookSearch')
              }
              onClose={closeModal}
              title="책 검색"
              width="800px"
            >
              <BookSearchModal />
            </PixelModal>

            {/* 알림 모달 */}
            {currentModal === 'notification' && <NotificationModal />}

            {/* 비밀번호 변경 모달 */}
            {currentModal === 'passwordReset' && <PasswordResetModal />}

            {/* 오늘의 문장 (명언) 모달 */}
            {currentModal === 'quote' && (
              <QuoteModal isOpen={true} onClose={closeModal} />
            )}

            {/* 책 상세 모달 */}
            {currentModal === 'bookDetail' && modalProps.isbn && (
              <BookDetailModal
                isbn={modalProps.isbn}
                onClose={() => {
                  if (modalProps.from === 'bookSearch') {
                    openModal('bookSearch');
                  } else if (modalProps.from === 'bookshelf') {
                    openModal('bookshelf');
                  } else {
                    closeModal();
                  }
                }}
                initialIsWished={modalProps.initialIsWished}
              />
            )}

            {/* 독서 타이머: 책 선택 모달 */}
            {currentModal === 'bookSelection' && (
              <BookSelectionModal isChanging={modalProps.isChanging} />
            )}

            {/* 독서 타이머: 독서 종료 모달 */}
            {currentModal === 'readingCompletion' && <ReadingCompletionModal />}

            {/* 출석 체크 모달 */}
            <PixelModal
              isOpen={currentModal === 'attendance'}
              onClose={closeModal}
              title="출석 체크"
              width="550px"
            >
              <AttendanceModal
                isOpen={currentModal === 'attendance'}
                onClose={closeModal}
              />
            </PixelModal>
          </div>
        );
      })}

      {/* 오버레이: 타인 프로필 모달 (항상 최상단, 스택 외 별도 관리) */}
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
