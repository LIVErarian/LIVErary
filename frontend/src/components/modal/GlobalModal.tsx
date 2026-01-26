import { useModalStore } from '@/store/useModalStore';
import { PixelButton } from '../common/PixelButton';
import { PixelModal } from '../common/PixelModal';

const ElevatorContent = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <p>이동할 층을 선택해주세요.</p>
    <PixelButton>1층 - 로비</PixelButton>
    <PixelButton>2층 - 독서실</PixelButton>
    <PixelButton>3층 - 독서 모임 공간</PixelButton>
    <PixelButton>4층 - 북 콘서트 홀</PixelButton>
  </div>
);

const BoardContent = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <p>게시판 기능은 준비 중입니다.</p>
  </div>
);

const LogoutContent = ({ onClose }: { onClose: () => void }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        padding: '10px',
      }}
    >
      <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
        정말 로그아웃 하시겠습니까?
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <PixelButton
          size="sm"
          variant="danger"
          onClick={() => alert('로그아웃 API 호출')}
        >
          로그아웃
        </PixelButton>
        <PixelButton size="sm" onClick={onClose}>
          취소
        </PixelButton>
      </div>
    </div>
  );
};

export const GlobalModal = () => {
  const { currentModal, closeModal } = useModalStore();

  if (!currentModal) return null;

  return (
    <>
      {/* 1. 엘리베이터 모달 */}
      <PixelModal
        isOpen={currentModal === 'elevator'}
        onClose={closeModal}
        title="🛗 엘리베이터"
        width="320px"
      >
        <ElevatorContent />
      </PixelModal>

      {/* 2. 게시판 모달 */}
      <PixelModal
        isOpen={currentModal === 'board'}
        onClose={closeModal}
        title="📋 게시판"
        width="500px"
      >
        <BoardContent />
      </PixelModal>

      {/* 3. 로그아웃 모달 */}
      <PixelModal
        isOpen={currentModal === 'logout'}
        onClose={closeModal}
        title="로그아웃"
        width="300px"
      >
        <LogoutContent onClose={closeModal} />
      </PixelModal>
    </>
  );
};
