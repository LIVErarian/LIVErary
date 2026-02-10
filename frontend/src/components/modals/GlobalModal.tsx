import { useLogout } from '@/services/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';
import { BoardCreate } from '../board/BoardCreate';
import { BoardDetail } from '../board/BoardDetail';
import { BoardList } from '../board/BoardList';
import { BoardUpdate } from '../board/BoardUpdate';
import { BookDetailModal } from '../book/BookDetailModal';
import { BookSearchModal } from '../book/BookSearchModal';
import { BookSelectionModal } from '../book/BookSelectionModal';
import { BookshelfModal } from '../book/BookshelfModal';
import { QuoteModal } from '../book/QuoteModal';
import { ReadingCompletionModal } from '../book/ReadingCompletionModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { ErrorModal } from '../common/ErrorModal';
import { FullScreenImageModal } from '../common/FullScreenImageModal';
import { PixelModal } from '../common/PixelModal';
import { ElevatorModal } from '../game/modals/ElevatorModal';
import { SettingsModal } from '../game/modals/SettingsModal';
import { CreateRoomModal } from '../room/modals/CreateRoomModal';
import { RoomListModal } from '../room/modals/RoomListModal';
import { UpdateLiveRoomModal } from '../room/modals/UpdateLiveRoomModal';
import { FriendListModal } from '../social/modals/FriendListModal';
import { AttendanceModal } from '../user/modals/AttendanceModal';
import { NotificationModal } from '../user/modals/NotificationModal';
import { PasswordResetModal } from '../user/modals/PasswordResetModal';
import { PreferencesModal } from '../user/modals/PreferencesModal';
import { ProfileModal } from '../user/modals/ProfileModal';
import { RankingModal } from '../user/modals/RankingModal';

export const GlobalModal = () => {
  const { modalStack, closeModal, userProfile, closeUserProfile, openModal } =
    useModalStore();
  const { mutate: logout } = useLogout();

  // 모달 스택도 없고 유저 프로필 팝업도 없으면 렌더링 안 함
  if (modalStack.length === 0 && !userProfile) return null;

  const handleLogout = () => {
    closeModal();
    logout();
  };

  return (
    <>
      {modalStack.map((modalItem, index) => {
        const { type: currentModal, props: modalProps } = modalItem;
        const key = `${currentModal}-${index}`;

        const currentZIndex = 1000 + index * 10;

        return (
          <div key={key}>
            {/* 이동 모달 */}
            {currentModal === 'move' && (
              <ConfirmModal
                isOpen={true}
                onClose={() => {
                  modalProps.onCancel?.();
                  closeModal();
                }}
                onConfirm={() => {
                  modalProps.onConfirm?.();
                  closeModal();
                }}
                title={modalProps.title || '알림'}
                confirmText="이동하기"
                zIndex={currentZIndex}
              >
                <p>{modalProps.message}</p>
              </ConfirmModal>
            )}

            {/* 입장 확인 모달 */}
            {currentModal === 'entrance' && (
              <ConfirmModal
                isOpen={true}
                onClose={() => {
                  modalProps.onCancel?.();
                  closeModal();
                }}
                onConfirm={() => {
                  modalProps.onConfirm?.();
                  closeModal();
                }}
                title={modalProps.title || '입장 확인'}
                zIndex={currentZIndex}
              >
                <p style={{ textAlign: 'center' }}>
                  {modalProps.message || '이 방에 입장하시겠습니까?'}
                </p>
              </ConfirmModal>
            )}

            {/* 집중하기 모달 */}
            {currentModal === 'concentration' && (
              <ConfirmModal
                isOpen={true}
                onClose={closeModal}
                onConfirm={() => {
                  modalProps.onConfirm?.();
                  closeModal();
                  openModal('fullScreenImage', {
                    src: '/assets/videos/cozyRoom.mp4',
                    alt: 'Concentration Mode',
                    isVideo: true,
                  });
                }}
                title={modalProps.title || '확인'}
                zIndex={currentZIndex}
              >
                <p style={{ textAlign: 'center' }}>
                  {modalProps.message || '독서에 집중하시겠습니까?'}
                </p>
              </ConfirmModal>
            )}

            {/* 전체 화면 이미지 모달 (새로 추가됨) */}
            {currentModal === 'fullScreenImage' && modalProps.src && (
              <FullScreenImageModal
                src={modalProps.src}
                alt={modalProps.alt || 'Image'}
                isVideo={modalProps.isVideo}
                zIndex={currentZIndex}
              />
            )}

            {/* 엘리베이터 */}
            {currentModal === 'elevator' && (
              <ElevatorModal
                isOpen={true}
                onClose={closeModal}
                zIndex={currentZIndex}
              />
            )}

            {/* 게시판 관련 */}
            {currentModal === 'boardList' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="게시판"
                width="800px"
                zIndex={currentZIndex}
              >
                <BoardList />
              </PixelModal>
            )}

            {currentModal === 'boardCreate' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="게시글 작성"
                width="800px"
                zIndex={currentZIndex}
              >
                <BoardCreate />
              </PixelModal>
            )}

            {currentModal === 'boardDetail' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="게시글"
                width="800px"
                zIndex={currentZIndex}
              >
                {modalProps.boardId && (
                  <BoardDetail boardId={modalProps.boardId} />
                )}
              </PixelModal>
            )}

            {currentModal === 'boardUpdate' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="게시글 수정"
                width="800px"
                zIndex={currentZIndex}
              >
                {modalProps.boardId && (
                  <BoardUpdate boardId={modalProps.boardId} />
                )}
              </PixelModal>
            )}

            {/* 방 목록 */}
            {currentModal === 'roomList' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="방 목록"
                width="800px"
                zIndex={currentZIndex}
              >
                <RoomListModal />
              </PixelModal>
            )}

            {/* 방 만들기 */}
            {currentModal === 'createRoom' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="방 추가하기"
                width="500px"
                zIndex={currentZIndex}
              >
                <CreateRoomModal />
              </PixelModal>
            )}

            {/* 방 정보 수정 */}
            {currentModal === 'updateRoom' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="방 정보 수정"
                width="500px"
              >
                <UpdateLiveRoomModal />
              </PixelModal>
            )}

            {/* 랭킹 */}
            {currentModal === 'rank' && (
              <RankingModal
                isOpen={true}
                onClose={closeModal}
                zIndex={currentZIndex}
              />
            )}

            {/* 로그아웃 */}
            {currentModal === 'logout' && (
              <ConfirmModal
                isOpen={true}
                onClose={closeModal}
                onConfirm={handleLogout}
                title="로그아웃"
                isDanger={true}
                confirmText="로그아웃"
                zIndex={currentZIndex}
              >
                <p>정말 로그아웃 하시겠습니까?</p>
              </ConfirmModal>
            )}

            {/* 에러 및 알림 */}
            {(currentModal === 'error' || currentModal === 'alert') && (
              <ErrorModal
                isOpen={true}
                onClose={closeModal}
                title={modalProps.title || '알림'}
                message={
                  modalProps.message || '알 수 없는 오류가 발생했습니다.'
                }
                isError={currentModal === 'error'}
                zIndex={currentZIndex}
              />
            )}

            {/* 일반 확인(Confirm) */}
            {currentModal === 'confirm' && (
              <ConfirmModal
                isOpen={true}
                onClose={() => {
                  modalProps.onCancel?.();
                  closeModal();
                }}
                onConfirm={() => {
                  modalProps.onConfirm?.();
                  closeModal();
                }}
                title={modalProps.title || '확인'}
                confirmText={modalProps.title === '삭제' ? '삭제' : '확인'}
                isDanger={
                  modalProps.title === '삭제' || modalProps.title === '탈퇴'
                }
                zIndex={currentZIndex}
              >
                <p style={{ textAlign: 'center' }}>{modalProps.message}</p>
              </ConfirmModal>
            )}

            {/* 프로필 */}
            {currentModal === 'profile' && (
              <ProfileModal
                isOpen={true}
                onClose={closeModal}
                zIndex={currentZIndex}
              />
            )}

            {currentModal === 'userProfile' && (
              <ProfileModal
                isOpen={true}
                onClose={closeModal}
                userId={modalProps.userId}
                friendId={modalProps.friendId}
                zIndex={currentZIndex}
              />
            )}

            {/* 친구 목록 */}
            {currentModal === 'friendList' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="친구 목록"
                width="500px"
                zIndex={currentZIndex}
              >
                <FriendListModal initialTab={modalProps.initialTab} />
              </PixelModal>
            )}

            {/* 초기 설정(Preferences) */}
            {currentModal === 'preferences' && (
              <PreferencesModal
                isOpen={true}
                onClose={closeModal}
                preferences={modalProps.preferences}
                from={modalProps.from}
                zIndex={currentZIndex}
              />
            )}

            {/* 나의 서재 & 책 관련 */}
            {currentModal === 'bookshelf' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="나의 서재"
                width="800px"
                zIndex={currentZIndex}
              >
                <BookshelfModal />
              </PixelModal>
            )}

            {currentModal === 'bookSearch' && (
              <PixelModal
                isOpen={true}
                onClose={closeModal}
                title="책 검색"
                width="800px"
                zIndex={currentZIndex}
              >
                <BookSearchModal />
              </PixelModal>
            )}

            {/* 기타 기능 모달 */}
            {currentModal === 'notification' && (
              <NotificationModal
                isOpen={true}
                onClose={closeModal}
                zIndex={currentZIndex}
              />
            )}

            {currentModal === 'settings' && (
              <SettingsModal
                isOpen={true}
                onClose={closeModal}
                zIndex={currentZIndex}
              />
            )}

            {currentModal === 'passwordReset' && (
              <PasswordResetModal
                isOpen={true}
                onClose={closeModal}
                zIndex={currentZIndex}
              />
            )}

            {currentModal === 'quote' && (
              <QuoteModal
                isOpen={true}
                onClose={closeModal}
                zIndex={currentZIndex}
              />
            )}

            {currentModal === 'bookDetail' && modalProps.isbn && (
              <BookDetailModal
                isbn={modalProps.isbn}
                onClose={closeModal}
                initialIsWished={modalProps.initialIsWished}
                isOpen={true}
                zIndex={currentZIndex}
              />
            )}

            {currentModal === 'bookSelection' && (
              <BookSelectionModal
                isChanging={modalProps.isChanging}
                zIndex={currentZIndex}
              />
            )}

            {currentModal === 'readingCompletion' && (
              <ReadingCompletionModal zIndex={currentZIndex} />
            )}

            {currentModal === 'attendance' && (
              <AttendanceModal
                isOpen={true}
                onClose={closeModal}
                zIndex={currentZIndex}
              />
            )}
          </div>
        );
      })}

      {/* 타인 프로필 */}
      {userProfile && (
        <ProfileModal
          isOpen={true}
          onClose={closeUserProfile}
          userId={userProfile.userId}
          friendId={userProfile.friendId}
          zIndex={2000}
        />
      )}
    </>
  );
};
