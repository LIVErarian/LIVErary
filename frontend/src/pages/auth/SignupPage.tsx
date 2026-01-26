import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bgImage from '@/assets/images/signup_bg.png';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelContainer } from '@/components/common/PixelContainer';
import { PixelInput } from '@/components/common/PixelInput';
import { PixelModal } from '@/components/common/PixelModal';

import * as styles from './SignupPage.css';

export const SignupPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const navigate = useNavigate();

  const handleCheckEmail = () => {
    // TODO: 이메일 검증 로직 호출
    setModalMessage('검증된 이메일입니다!');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
    >
      <PixelContainer
        variant="board"
        header="회원 가입"
        style={{ width: '420px', margin: 'auto' }}
      >
        <div className={styles.formWrapper}>
          {/* 이메일 + 코드 검증 */}
          <div className={styles.checkRow}>
            <div className={styles.checkInput}>
              <PixelInput
                label="이메일"
                placeholder="example@liverary.com"
                fullWidth
              />
            </div>
            <PixelButton
              size="md"
              className={styles.checkBtn}
              onClick={handleCheckEmail}
            >
              확인
            </PixelButton>
          </div>

          {/* 닉네임 */}
          <PixelInput
            label="닉네임"
            placeholder="한글/영문 10자 이내"
            fullWidth
          />

          {/* 비밀번호 */}
          <PixelInput
            label="비밀번호"
            type="password"
            placeholder="8자 이상 입력해주세요"
            fullWidth
          />
          <PixelInput
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            fullWidth
          />

          {/* 가입 완료 버튼 */}
          <PixelButton
            fullWidth
            size="lg"
            style={{ marginTop: '2rem' }}
            onClick={() => navigate('/login')}
          >
            독서 시작하기
          </PixelButton>

          {/* 하단 링크 */}
          <div className={styles.footerText}>
            이미 계정이 있으신가요?
            <span
              className={styles.linkText}
              onClick={() => navigate('/login')}
            >
              로그인
            </span>
          </div>
        </div>
      </PixelContainer>
      {/* 모달 */}
      <PixelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="이메일 검증"
        width="320px"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          {modalMessage}
        </div>

        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <PixelButton size="sm" onClick={closeModal}>
            확인
          </PixelButton>
        </div>
      </PixelModal>
    </div>
  );
};
