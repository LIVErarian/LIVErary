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
      className={styles.container}
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

        <div className="styles.formContainer">
          <PixelInput label="ID" placeholder="아이디를 입력하세요" fullWidth />
          <PixelInput
            label="PASSWORD"
            type="password"
            placeholder="비밀번호"
            fullWidth
          />

          <PixelButton
            fullWidth
            size="lg"
            onClick={() => navigate('/game')}
            style={{ marginTop: '1rem' }}
          >
            로그인
          </PixelButton>

          <div className={styles.linkGroup}>
            <span className={styles.link} onClick={() => navigate('/signup')}>
              회원가입
            </span>
            <span
              className={styles.link}
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
