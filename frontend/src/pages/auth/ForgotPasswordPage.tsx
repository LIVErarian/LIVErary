import { useNavigate } from 'react-router-dom';

import bgImage from '@/assets/images/signup_bg.png';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelContainer } from '@/components/common/PixelContainer';
import { PixelInput } from '@/components/common/PixelInput';

import * as styles from './SignupPage.css';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

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
              onClick={() => alert('검증된 이메일입니다!')}
            >
              확인
            </PixelButton>
          </div>

          {/* 비밀번호 */}
          <PixelInput
            label="임시 비밀번호"
            type="password"
            placeholder="메일로 받은 임시 비밀번호를 작성해주세요"
            fullWidth
          />

          {/* 비밀번호 변경 버튼 */}
          <PixelButton
            fullWidth
            size="lg"
            style={{ marginTop: '2rem' }}
            onClick={() => {
              alert('비밀번호를 변경해주세요!');
              navigate('/login');
            }}
          >
            비밀번호 변경하기
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
    </div>
  );
};
