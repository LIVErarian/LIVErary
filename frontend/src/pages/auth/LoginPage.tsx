import { useNavigate } from 'react-router-dom';

import bgImage from '@/assets/images/login_bg.png';
import logoImage from '@/assets/images/logo.png';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelContainer } from '@/components/common/PixelContainer';
import { PixelInput } from '@/components/common/PixelInput';

import * as styles from './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();

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

        <div className={styles.formWrapper}>
          <PixelInput
            label="EMAIL"
            placeholder="이메일을 입력하세요"
            fullWidth
          />
          <PixelInput
            label="PASSWORD"
            type="password"
            placeholder="비밀번호"
            fullWidth
          />

          {/* 로그인 버튼 */}
          <PixelButton
            fullWidth
            size="lg"
            onClick={() => navigate('/game')}
            style={{ marginTop: '2rem' }}
          >
            로그인
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
        </div>
      </PixelContainer>
    </div>
  );
};
