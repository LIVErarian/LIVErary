import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bgImage from '@/assets/images/signup_bg.png';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelContainer } from '@/components/common/PixelContainer';
import { PixelInput } from '@/components/common/PixelInput';
import { useFindPassword } from '@/hooks/queries/useAuth';

import * as styles from './SignupPage.css';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { mutate: findPassword, isPending } = useFindPassword();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    if (!email) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('유효한 이메일 형식이 아닙니다.');
      return;
    }

    findPassword(
      { email },
      {
        onSuccess: () => {
          alert(
            '가입하신 이메일로 임시 비밀번호를 전송했습니다.\n로그인 후 비밀번호를 변경해주세요.',
          );
          navigate('/login');
        },
        onError: () => {
          setErrorMessage('가입된 이메일이 아니거나 오류가 발생했습니다.');
        },
      },
    );
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
        header="비밀번호 찾기"
        style={{ width: '420px', margin: 'auto' }}
      >
        <div className={styles.formWrapper}>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#666',
              lineHeight: '1.4',
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            가입 시 등록한 이메일을 입력하시면
            <br />
            임시 비밀번호를 전송해 드립니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
              <span
                style={{
                  color: 'red',
                  fontSize: '0.8rem',
                  paddingLeft: '4px',
                }}
              >
                * {errorMessage}
              </span>
            )}
          </div>

          <PixelButton
            fullWidth
            size="lg"
            style={{ marginTop: '1.5rem' }}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? '전송 중...' : '임시 비밀번호 받기'}
          </PixelButton>

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
