import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bgImage from '@/assets/images/signup_bg.png';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelContainer } from '@/components/common/PixelContainer';
import { PixelInput } from '@/components/common/PixelInput';
import { useFindPassword } from '@/services/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './ForgotPasswordPage.css';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { openModal } = useModalStore();
  const { mutate: findPassword, isPending } = useFindPassword();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    // 이메일 입력 체크
    if (!email) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    // 이메일 정규식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('유효한 이메일 형식이 아닙니다.');
      return;
    }

    // 비밀번호 찾기 API 호출
    findPassword(
      { email },
      {
        onSuccess: () => {
          openModal('alert', {
            title: '알림',
            message:
              '임시 비밀번호가 이메일로 전송되었습니다.\n로그인 후 비밀번호를 변경해주세요.',
          });
          navigate('/login');
        },
        onError: () => {
          setErrorMessage('가입된 이메일이 아니거나 오류가 발생했습니다.');
        },
      },
    );
  };

  // 배경 이미지 설정
  return (
    <div
      className={styles.container}
      style={
        {
          '--bg-image': `url(${bgImage})`,
        } as React.CSSProperties
      }
    >
      {/* 비밀번호 찾기 컨테이너 */}
      <PixelContainer
        variant="board"
        header="비밀번호 찾기"
        style={{ width: '420px', margin: 'auto' }}
      >
        <div className={styles.formWrapper}>
          <p className={styles.description}>
            가입 시 등록한 이메일을 입력하시면
            <br />
            임시 비밀번호를 전송해 드립니다.
          </p>

          {/* 이메일 입력 폼 */}
          <div className={styles.inputGroup}>
            <PixelInput
              label="이메일"
              placeholder="example@liverary.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
              fullWidth
            />
            {errorMessage && (
              <span className={styles.errorMessage}>* {errorMessage}</span>
            )}
          </div>

          {/* 임시 비밀번호 받기 버튼 */}
          <PixelButton
            fullWidth
            size="lg"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? '전송 중...' : '임시 비밀번호 받기'}
          </PixelButton>

          {/* 로그인 페이지로 이동 */}
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
    </div>
  );
};
