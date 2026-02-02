import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bgImage from '@/assets/images/login_bg.png';
import logoImage from '@/assets/images/logo.png';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelContainer } from '@/components/common/PixelContainer';
import { PixelInput } from '@/components/common/PixelInput';
import { useLogin } from '@/hooks/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { openModal } = useModalStore();

  const { mutate: login, isPending, isError } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  useEffect(() => {
    if (isError) {
      console.log('로그인 실패 에러 발생');
      openModal('error', {
        title: '로그인 실패',
        message: '이메일 또는 비밀번호를 확인해주세요.',
      });
    }
  }, [isError, openModal]);

  return (
    <div
      className={styles.pageContainer}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
    >
      <PixelContainer
        variant="dark"
        header={
          <img
            src={logoImage}
            alt="LIVERary"
            style={{ width: '180px', imageRendering: 'pixelated' }}
          />
        }
        style={{ width: '380px' }}
      >
        <p className={styles.description}>LIVErary에 오신 것을 환영합니다!</p>

        <form className={styles.formWrapper} onSubmit={handleLogin}>
          <PixelInput
            label="EMAIL"
            placeholder="이메일을 입력하세요"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending} // 로딩 중엔 입력 방지
          />
          <PixelInput
            label="PASSWORD"
            type="password"
            placeholder="비밀번호"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
          />

          {/* 로그인 버튼 */}
          <PixelButton
            type="submit"
            fullWidth
            size="lg"
            style={{ marginTop: '2rem' }}
            disabled={isPending}
          >
            {isPending ? '로그인 중...' : '로그인'}
          </PixelButton>

          {/* 하단 링크 */}
          <div className={styles.linkGroup}>
            <span
              className={styles.linkText}
              onClick={() => navigate('/signup')}
            >
              회원가입
            </span>
            <span
              className={styles.linkText}
              onClick={() => navigate('/forgot-password')}
            >
              비밀번호 찾기
            </span>
          </div>
        </form>
      </PixelContainer>
    </div>
  );
};
